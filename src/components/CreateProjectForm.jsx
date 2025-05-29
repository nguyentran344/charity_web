import React, { useState } from "react";
import axios from "axios";
import "./CreateProjectForm.css";

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
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("");

  const categories = [
    "Thiên tai",
    "Hoàn cảnh khó khăn",
    "Giáo dục",
    "Y tế",
    "Môi trường",
    "Cộng đồng",
    "Khẩn cấp",
    "Văn hóa và di sản",
    "Trẻ em và thanh thiếu niên",
    "Người cao tuổi",
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return "";
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", "chairy");
      formData.append("cloud_name", "dc8ay7mi1");

      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dc8ay7mi1/image/upload",
        formData
      );
      setUploading(false);
      return response.data.secure_url;
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      setUploading(false);
      alert("Lỗi tải ảnh lên Cloudinary");
      return "";
    }
  };

  const onCreateProject = async () => {
    if (uploading) return;
    if (!category) {
      alert("Vui lòng chọn danh mục dự án");
      return;
    }
    const imageUrl = await uploadImageToCloudinary();
    if (!imageUrl) {
      alert("Vui lòng tải lên ảnh dự án");
      return;
    }
    await handleCreateProject(
      projectName,
      projectDescription,
      imageUrl,
      category
    );
  };

  return (
    <div className="create-project-form">
      <h2 className="form-title">Tạo Dự Án</h2>
      {error && <p className="form-error">{error}</p>}
      <input
        type="text"
        placeholder="Tên Dự Án"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        className="form-input"
      />
      <textarea
        placeholder="Mô Tả Dự Án"
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
        className="form-textarea"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="form-input"
      >
        <option value="">Chọn danh mục</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <div className="form-image-upload">
        <label className="form-label">Ảnh Dự Án (tối đa 5MB)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="form-input-file"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="form-image-preview"
          />
        )}
      </div>
      <button
        onClick={onCreateProject}
        className="form-button"
        disabled={
          !projectName.trim() ||
          !projectDescription.trim() ||
          !imageFile ||
          !category ||
          uploading
        }
      >
        {uploading ? "Đang Tải Ảnh..." : "Tạo Dự Án"}
      </button>
    </div>
  );
};

export default CreateProjectForm;
