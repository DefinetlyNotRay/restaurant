"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminRoute } from "@/components/AdminRoute";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Sparkles, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please choose an image to upload");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { imageUrl } = await uploadRes.json();

      const extractRes = await fetch("/api/ai-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      if (!extractRes.ok) throw new Error("AI extraction failed");
      const extracted = await extractRes.json();

      setName(extracted.name || "");
      setDescription(extracted.description || "");
      setPrice(extracted.price || "");

      toast.success("✨ AI extracted product details. Review and save.");
    } catch (e) {
      toast.error((e as Error).message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !description || !price || !preview) {
      toast.error("Missing required fields");
      return;
    }

    try {
      if (!file) throw new Error("No image to save");

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const { imageUrl } = await uploadRes.json();

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          image_url: imageUrl,
        }),
      });

      if (!res.ok) throw new Error("Failed to save product");
      toast.success("✅ Product created successfully");
      setFile(null);
      setPreview(null);
      setName("");
      setDescription("");
      setPrice("");
    } catch (e) {
      toast.error((e as Error).message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Upload Product
              </h1>
              <p className="text-slate-600 mt-1">
                Upload an image and let AI extract the details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Choose Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-orange-500 file:to-orange-600 file:text-white hover:file:from-orange-600 hover:file:to-orange-700 file:cursor-pointer file:shadow-md"
                  />
                </div>

                {preview && (
                  <div className="relative w-full aspect-square overflow-hidden rounded-2xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 shadow-md">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  loading={loading}
                  disabled={!file}
                  className="w-full flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Extract With AI
                </Button>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5 text-orange-600" />
                  Product Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Product Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Grilled Chicken Burger"
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                    className="flex w-full rounded-xl border-2 border-orange-100 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
                <Input
                  label="Price (USD)"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) =>
                    setPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="9.99"
                />
                <Button
                  onClick={handleSave}
                  loading={loading}
                  disabled={!name || !price}
                  className="w-full flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Product
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
