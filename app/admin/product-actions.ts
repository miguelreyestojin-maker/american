"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCategory } from "@/lib/categories";
import { requireAdmin } from "@/lib/supabase/admin";

const bucket = "product-images";
const maxImageBytes = 5 * 1024 * 1024;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ImageExtension = "jpg" | "png" | "webp";

type UploadResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "failed" }
  | { status: "uploaded"; url: string; path: string };

function extensionFor(type: string): ImageExtension | null {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

function redirectAdmin(params: Record<string, string | undefined>): never {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      search.set(key, value);
    }
  }

  const query = search.toString();
  redirect(query ? `/admin?${query}` : "/admin");
}

function refreshCatalog() {
  revalidatePath("/");
  revalidatePath("/admin");
}

function readId(value: FormDataEntryValue | null) {
  const id = String(value ?? "");
  return uuidPattern.test(id) ? id : null;
}

function readEdit(formData: FormData) {
  const id = readId(formData.get("edit"));
  return id ? { edit: id } : {};
}

function readProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const price = Number(
    String(formData.get("price_gtq") ?? "").replace(",", "."),
  );
  const stock = Number(formData.get("stock"));

  if (
    !title ||
    !isCategory(category) ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0
  ) {
    return null;
  }

  return {
    title,
    description,
    category,
    price_gtq: price,
    stock,
    is_available: formData.get("is_available") === "on",
  };
}

function storagePath(url: string | null) {
  if (!url) {
    return null;
  }

  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

async function uploadImage(file: File): Promise<UploadResult> {
  if (file.size === 0) {
    return { status: "empty" };
  }

  const extension = extensionFor(file.type);
  if (!extension || file.size > maxImageBytes) {
    return { status: "invalid" };
  }

  const path = `${crypto.randomUUID()}.${extension}`;
  const supabase = await requireAdmin();
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    console.error(error.message);
    return { status: "failed" };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { status: "uploaded", url: data.publicUrl, path };
}

async function removeImage(url: string | null) {
  const path = storagePath(url);
  if (!path) {
    return;
  }

  const supabase = await requireAdmin();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(error.message);
  }
}

export async function saveProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const id = readId(formData.get("id"));
  const edit = id ? { edit: id } : {};
  const product = readProduct(formData);
  if (!product) {
    redirectAdmin({ form: "invalid", ...edit });
  }

  const image = formData.get("image");
  const uploaded = await uploadImage(image instanceof File ? image : new File([], ""));
  let imageUrl: string | null = null;

  switch (uploaded.status) {
    case "empty":
      break;
    case "invalid":
      redirectAdmin({ form: "image", ...edit });
      break;
    case "failed":
      redirectAdmin({ form: "save", ...edit });
      break;
    case "uploaded":
      imageUrl = uploaded.url;
      break;
    default: {
      const unreachable: never = uploaded;
      throw unreachable;
    }
  }

  if (id) {
    const { data: current, error: readError } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .maybeSingle();
    if (readError || !current) {
      console.error(readError?.message ?? "Producto no encontrado");
      redirectAdmin({ form: "save", ...edit });
    }

    const { error } = await supabase
      .from("products")
      .update({
        ...product,
        ...(imageUrl ? { image_url: imageUrl } : {}),
      })
      .eq("id", id);
    if (error) {
      console.error(error.message);
      redirectAdmin({ form: "save", ...edit });
    }

    if (imageUrl) {
      await removeImage(current.image_url);
    }

    refreshCatalog();
    redirectAdmin({ notice: "updated" });
  }

  const { error } = await supabase.from("products").insert({
    ...product,
    image_url: imageUrl,
  });
  if (error) {
    console.error(error.message);
    redirectAdmin({ form: "save" });
  }

  refreshCatalog();
  redirectAdmin({ notice: "saved" });
}

export async function adjustStock(formData: FormData) {
  const supabase = await requireAdmin();
  const id = readId(formData.get("id"));
  const delta = formData.get("delta") === "-1" ? -1 : formData.get("delta") === "1" ? 1 : null;
  const edit = readEdit(formData);
  if (!id || delta === null) {
    redirectAdmin(edit);
  }

  const { data, error } = await supabase
    .from("products")
    .select("stock")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    console.error(error?.message ?? "Producto no encontrado");
    redirectAdmin({ form: "save", ...edit });
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: Math.max(0, data.stock + delta) })
    .eq("id", id);
  if (updateError) {
    console.error(updateError.message);
    redirectAdmin({ form: "save", ...edit });
  }

  refreshCatalog();
  redirectAdmin(edit);
}

export async function setAvailability(formData: FormData) {
  const supabase = await requireAdmin();
  const id = readId(formData.get("id"));
  const available = formData.get("available");
  const edit = readEdit(formData);
  if (!id || (available !== "true" && available !== "false")) {
    redirectAdmin(edit);
  }

  const { error } = await supabase
    .from("products")
    .update({ is_available: available === "true" })
    .eq("id", id);
  if (error) {
    console.error(error.message);
    redirectAdmin({ form: "save", ...edit });
  }

  refreshCatalog();
  redirectAdmin(edit);
}

export async function deleteProduct(formData: FormData) {
  const supabase = await requireAdmin();
  const id = readId(formData.get("id"));
  if (!id) {
    redirectAdmin({});
  }

  const { data, error } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    console.error(error?.message ?? "Producto no encontrado");
    redirectAdmin({ form: "save" });
  }

  const { error: deleteError } = await supabase
    .from("products")
    .delete()
    .eq("id", id);
  if (deleteError) {
    console.error(deleteError.message);
    redirectAdmin({ form: "save" });
  }

  await removeImage(data.image_url);
  refreshCatalog();
  redirectAdmin({ notice: "deleted" });
}
