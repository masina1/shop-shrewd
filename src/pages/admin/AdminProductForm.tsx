import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, TrendingUp } from "lucide-react";
import { getProductById, getOffersForProduct, mockProducts, type Product } from "@/lib/adminMockData";
import { useToast } from "@/hooks/use-toast";

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = id !== "new";
  
  const existingProduct = isEdit ? getProductById(id!) : null;
  const relatedOffers = isEdit ? getOffersForProduct(id!) : [];

  const [formData, setFormData] = useState<Partial<Product>>({
    name: existingProduct?.name || "",
    brand: existingProduct?.brand || "",
    size: existingProduct?.size || "",
    category: existingProduct?.category || "",
    gtin: existingProduct?.gtin || "",
    image: existingProduct?.image || "",
    normalizedName: existingProduct?.normalizedName || "",
    description: existingProduct?.description || "",
    status: existingProduct?.status || "active",
    tags: existingProduct?.tags || []
  });

  const [newTag, setNewTag] = useState("");

  const categories = ["Dairy", "Deli", "Bakery", "Beverages", "Fruits", "Vegetables", "Meat", "Frozen"];

  const handleInputChange = (field: keyof Product, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-generate normalized name when name changes
      ...(field === 'name' && {
        normalizedName: value.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      })
    }));
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.brand || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: isEdit ? "Product Updated" : "Product Created",
      description: `${formData.name} has been ${isEdit ? 'updated' : 'created'} successfully`,
    });

    navigate("/admin/products");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service and get back a URL
      const mockUrl = `/uploads/${file.name}`;
      setFormData(prev => ({ ...prev, image: mockUrl }));
      toast({
        title: "Image Uploaded",
        description: `${file.name} uploaded successfully`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEdit ? "Edit Product" : "New Product"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit 
            ? `Update details for ${existingProduct?.name}`
            : "Add a new product to your catalog"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Lapte 1.5% 1.5L"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand *</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="e.g., Napolact"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="size">Size/Unit</Label>
                    <Input
                      id="size"
                      value={formData.size}
                      onChange={(e) => handleInputChange('size', e.target.value)}
                      placeholder="e.g., 1.5 L, 100 g"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gtin">GTIN/SKU</Label>
                    <Input
                      id="gtin"
                      value={formData.gtin || ""}
                      onChange={(e) => handleInputChange('gtin', e.target.value)}
                      placeholder="e.g., 5941234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => handleInputChange('status', value as Product['status'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="normalizedName">Normalized Name</Label>
                  <Input
                    id="normalizedName"
                    value={formData.normalizedName}
                    onChange={(e) => handleInputChange('normalizedName', e.target.value)}
                    placeholder="Auto-generated from product name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for search and matching. Auto-generated but can be customized.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.image ? (
                  <div className="space-y-2">
                    <img
                      src={formData.image}
                      alt="Product"
                      className="w-full aspect-square object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <Label htmlFor="image" className="cursor-pointer">
                      <span className="text-sm font-medium">Upload Image</span>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Related Offers (Edit mode only) */}
            {isEdit && relatedOffers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Related Offers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relatedOffers.map(offer => (
                      <div key={offer.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{offer.price} RON</p>
                          <p className="text-sm text-muted-foreground">
                            Store ID: {offer.storeId}
                          </p>
                        </div>
                        {offer.promo && (
                          <Badge variant="destructive">{offer.promo}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full">
                    {isEdit ? "Update Product" : "Create Product"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/products")}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}