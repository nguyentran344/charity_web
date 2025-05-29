import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const defaultCategories = [
    "Tất cả",
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
  const projectCategories = useMemo(() => {
    const uniqueCategories = new Set(
      projects.map((project) => project.category)
    );
    return defaultCategories.filter(
      (category) => category === "Tất cả" || uniqueCategories.has(category)
    );
  }, [projects]);

  const overview = useMemo(() => {
    const totalProjects = projects.length;
    const totalDonated = projects
      .reduce((sum, project) => sum + parseFloat(project.totalDonated), 0)
      .toFixed(4);
    const totalDonors = new Set(projects.flatMap((project) => project.donors))
      .size;
    return { totalProjects, totalDonated, totalDonors };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === "Tất cả" || project.category === selectedCategory;
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [projects, selectedCategory, searchTerm]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    return filteredProjects.slice(startIndex, endIndex);
  }, [filteredProjects, currentPage]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

  return (
    <div className="home">
      <div className="overview-section">
        <h2 className="overview-title">Tổng quan</h2>
        <div className="overview-stats">
          <div className="stat-card">
            <h3>{overview.totalProjects}</h3>
            <p>Dự án</p>
          </div>
          <div className="stat-card">
            <h3>{overview.totalDonated} ETH</h3>
            <p>Tổng quyên góp</p>
          </div>
          <div className="stat-card">
            <h3>{overview.totalDonors}</h3>
            <p>Người quyên góp</p>
          </div>
        </div>
      </div>
      <div className="filter-section">
        <div className="filter-group">
          <label htmlFor="category-filter">Danh mục:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            {projectCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="search-group">
          <input
            type="text"
            placeholder="Tìm kiếm dự án..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>
      </div>
      <h2 className="home-title">Danh sách dự án từ thiện</h2>
      {filteredProjects.length === 0 ? (
        <p>Không tìm thấy dự án nào.</p>
      ) : (
        <>
          <div className="project-grid">
            {paginatedProjects.map((project) => (
              <div key={project.id} className="project-card">
                <img
                  src={
                    project.imageUrl ||
                    "https://placehold.co/300x200?text=Không+có+ảnh"
                  }
                  alt={project.name || "Dự án từ thiện"}
                  className="project-image"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/300x200?text=Không+có+ảnh";
                  }}
                />
                <div className="project-content">
                  <h3>{project.name}</h3>
                  <p>
                    <strong>Tổng quyên góp:</strong> {project.totalDonated} ETH
                  </p>
                  <p>
                    <strong>Trạng thái:</strong>{" "}
                    {project.active ? "Đang hoạt động" : "Đã kết thúc"}
                  </p>
                  <Link to={`/project/${project.id}`} className="detail-button">
                    Chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Trước
              </button>
              <span className="pagination-info">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
