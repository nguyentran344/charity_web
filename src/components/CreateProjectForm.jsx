import React, { useState } from "react";
import {
  Upload,
  Sparkles,
  Heart,
  Globe,
  Image as ImageIcon,
} from "lucide-react";

const CreateProjectForm = ({
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  handleCreateProject,
  error,
}) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    "Y tế & Sức khỏe",
    "Giáo dục",
    "Thiên tai",
    "Môi trường",
    "Trẻ em mồ côi",
    "Người già neo đơn",
    "Cộng đồng",
    "Khẩn cấp",
    "Khác",
  ];

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return alert("Ảnh quá lớn. Giới hạn 10MB");

    setImageFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(f);
  };

  const uploadToIPFS = async (file) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: "307a8117a3dc5dd065af",
            pinata_secret_api_key:
              "833783b52250b189b2888a8b0f53fe9515a74458bfd6144e2e0f9ddad0fe496d",
          },
          body: form,
        }
      );

      const data = await res.json();
      if (data.IpfsHash) {
        return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
      }
      throw new Error("Upload error");
    } catch (err) {
      alert("Upload thất bại: " + err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onCreateProject = async () => {
    if (!projectName.trim()) return alert("Nhập tên dự án");
    if (!projectDescription.trim()) return alert("Nhập mô tả");
    if (!category) return alert("Chọn danh mục");
    if (!imageFile) return alert("Chọn ảnh dự án");

    const url = await uploadToIPFS(imageFile);
    if (!url) return;

    await handleCreateProject(projectName, projectDescription, url, category);

    setProjectName("");
    setProjectDescription("");
    setCategory("");
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50 flex justify-center py-16 px-4">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-3xl p-10 border border-gray-200">
        {/* TITLE */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Tạo Dự Án
          </h1>
          <p className="text-gray-600 mt-4 text-lg">
            Hãy tạo nên điều tử tế. Mọi đóng góp được lưu trên blockchain.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <p className="bg-red-100 text-red-700 border border-red-300 p-4 rounded-xl text-center font-semibold mb-6">
            {error}
          </p>
        )}

        {/* IMAGE UPLOAD */}
        <div className="mb-12">
          <label className="block text-lg font-semibold mb-4 text-gray-700">
            Hình ảnh dự án
          </label>

          {!imagePreview ? (
            <label className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition p-12 rounded-2xl">
              <ImageIcon className="w-20 h-20 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium">Chọn hoặc kéo thả ảnh</p>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="preview"
                className="rounded-2xl shadow-lg border"
              />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="absolute top-4 right-4 bg-red-500 text-white px-5 py-2 rounded-full font-medium shadow"
              >
                Đổi ảnh
              </button>
            </div>
          )}
        </div>

        {/* INPUTS */}
        <div className="space-y-6">
          <div>
            <label className="font-semibold text-gray-700 block mb-2">
              Tên dự án
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-purple-200"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ví dụ: Xây trường học cho trẻ em vùng cao"
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-2">
              Danh mục
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-4 focus:ring-amber-200"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700 block mb-2">
              Mô tả dự án
            </label>
            <textarea
              rows={7}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-4 focus:ring-purple-200"
              placeholder="Hãy kể câu chuyện chân thành nhất của bạn..."
            ></textarea>
          </div>
        </div>

        {/* BUTTON */}
        <div className="text-center mt-12">
          <button
            disabled={uploading}
            onClick={onCreateProject}
            className="px-16 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-2xl font-bold rounded-full shadow-xl hover:scale-105 transition disabled:bg-gray-400 disabled:hover:scale-100"
          >
            {uploading ? "Đang upload..." : "Tạo Dự Án"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectForm;
