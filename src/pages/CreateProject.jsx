// src/pages/CreateProject.jsx
import React, { useState } from "react";
import { Upload, Sparkles, Heart, Globe, Loader2 } from "lucide-react";

export default function CreateProject({ handleCreateProject }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const uploadToIPFS = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: "307a8117a3dc5dd065af",
            pinata_secret_api_key:
              "833783b52250b189b2888a8b0f53fe9515a74458bfd6144e2e0f9ddad0fe496d",
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (data.IpfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      }
      throw new Error(data.error?.message || "Upload thất bại");
    } catch (err) {
      alert("Lỗi upload ảnh: " + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !category || !goal || !imageFile) {
      alert("Vui lòng điền đầy đủ thông tin và chọn ảnh!");
      return;
    }
    if (isNaN(goal) || Number(goal) <= 0) {
      alert("Mục tiêu phải là số lớn hơn 0");
      return;
    }

    const ipfsUrl = await uploadToIPFS(imageFile);
    if (!ipfsUrl) return;

    handleCreateProject(name, description, ipfsUrl, category, goal);

    // Reset form
    setName("");
    setDescription("");
    setCategory("");
    setGoal("");
    setImageFile(null);
    setImagePreview("");
    alert("Tạo dự án thành công!");
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* DÒNG QUAN TRỌNG NHẤT – CĂN GIỮA HOÀN HẢO */}
        <div className="w-full max-w-5xl mx-auto">
          {/* Tiêu đề */}
          <div className="text-center mb-16">
            <div className="inline-block p-6 bg-white/90 backdrop-blur rounded-full shadow-2xl mb-8">
              <Heart className="w-28 h-28 text-pink-500 animate-pulse" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Tạo Dự Án Từ Thiện
            </h1>
            <p className="mt-8 text-2xl md:text-3xl text-gray-700 font-medium">
              Minh bạch 100% • Lưu vĩnh viễn trên blockchain
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white/96 backdrop-blur-2xl rounded-3xl shadow-3xl border border-purple-100 overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className="p-8 md:p-12 lg:p-20 space-y-16"
            >
              {/* Upload ảnh */}
              <div className="text-center">
                <h3 className="text-4xl font-bold mb-10 flex items-center justify-center gap-5">
                  <Upload className="w-14 h-14 text-purple-600" />
                  Hình ảnh dự án
                  <Sparkles className="w-12 h-12 text-amber-500" />
                </h3>

                {!imagePreview ? (
                  <label className="cursor-pointer inline-block">
                    <div className="border-4 border-dashed border-purple-300 rounded-3xl p-32 hover:border-purple-500 transition-all bg-gradient-to-br from-purple-50 to-pink-50">
                      <Upload className="w-40 h-40 mx-auto mb-8 text-purple-400" />
                      <p className="text-4xl font-black text-gray-800">
                        Click hoặc kéo thả ảnh
                      </p>
                      <p className="text-xl text-gray-600 mt-4">
                        Lưu vĩnh viễn trên IPFS
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                  </label>
                ) : (
                  <div className="relative inline-block max-w-4xl mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full rounded-3xl shadow-2xl border-12 border-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
                      }}
                      className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white px-10 py-5 rounded-full font-bold text-2xl shadow-2xl"
                    >
                      Thay ảnh
                    </button>
                    <div className="mt-8">
                      <span className="inline-flex items-center gap-4 bg-gradient-to-r from-emerald-100 to-teal-100 px-10 py-5 rounded-full text-emerald-700 font-bold text-xl shadow-lg">
                        <Globe className="w-8 h-8" />
                        Sẵn sàng upload IPFS
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Các ô nhập liệu */}
              <div className="grid lg:grid-cols-2 gap-12">
                <input
                  type="text"
                  placeholder="Tên dự án từ thiện"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-12 py-8 text-2xl rounded-3xl border-4 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium"
                  required
                />
                <input
                  type="number"
                  step="0.001"
                  placeholder="Mục tiêu (ETH)"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="px-12 py-8 text-2xl rounded-3xl border-4 border-pink-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all font-medium"
                  required
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-12 py-8 text-2xl rounded-3xl border-4 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 bg-white font-medium"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option>Y tế & Sức khỏe</option>
                  <option>Giáo dục & Học bổng</option>
                  <option>Cứu trợ thiên tai</option>
                  <option>Bảo vệ môi trường</option>
                  <option>Trẻ em mồ côi</option>
                  <option>Người già neo đơn</option>
                  <option>Khác</option>
                </select>

                <div className="lg:col-span-2">
                  <textarea
                    placeholder="Kể câu chuyện chân thành của bạn... (sẽ được lưu vĩnh viễn)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={12}
                    className="w-full px-12 py-8 text-2xl rounded-3xl border-4 border-purple-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 resize-none outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              {/* Nút tạo dự án */}
              <div className="text-center pt-12">
                <button
                  type="submit"
                  disabled={uploading}
                  className="group inline-flex items-center gap-10 px-40 py-12 rounded-full text-5xl font-black text-white shadow-3xl transition-all hover:scale-110 disabled:opacity-60 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-20 h-20 animate-spin" />
                      Đang upload...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-20 h-20 group-hover:animate-spin" />
                      TẠO DỰ ÁN NGAY
                      <Heart className="w-20 h-20 animate-pulse" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* ← Đóng div max-w-5xl mx-auto */}
      </div>
    </div>
  );
}
