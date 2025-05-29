import React, { useState } from "react";
import "./CreateProject.css";

const CreateProject = ({
  projectName,
  setProjectName,
  projectDescription,
  setProjectDescription,
  handleCreateProject,
  error,
  category,
  setCategory,
}) => {
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateProject(
      projectName,
      projectDescription,
      imageUrl,
      category
    ).then(() => {
      // Reset các trường sau khi tạo thành công
      setImageUrl("");
      setProjectName("");
      setProjectDescription("");
      setCategory("");
    });
  };

  return (
    <div className="create-project">
      <h2>Tạo dự án từ thiện</h2>
      {error && <p className="error-text">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="project-name">Tên dự án:</label>
          <input
            type="text"
            id="project-name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Nhập tên dự án"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="project-description">Mô tả:</label>
          <textarea
            id="project-description"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Nhập mô tả dự án"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="image-url">URL ảnh:</label>
          <input
            type="url"
            id="image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Nhập URL ảnh dự án (ví dụ: https://example.com/image.jpg)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Danh mục:</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Chọn danh mục
            </option>
            <option value="Thiên tai">Thiên tai</option>
            <option value="Giáo dục">Giáo dục</option>
            <option value="Y tế">Y tế</option>
            <option value="Môi trường">Môi trường</option>
          </select>
        </div>
        <button type="submit" className="create-button">
          Tạo dự án
        </button>
      </form>
    </div>
  );
};

export default CreateProject;
