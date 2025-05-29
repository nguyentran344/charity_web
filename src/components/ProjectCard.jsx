import React, { useState, useEffect } from "react";
import DonorList from "./DonorList";
import "./ProjectCard.css";

const ProjectCard = ({
  project,
  donationAmount,
  setDonationAmount,
  handleDonate,
  handleEndProject,
  user,
  currentAccount,
  walletConnected,
  contract,
}) => {
  const isCreator =
    walletConnected &&
    currentAccount &&
    project.creator.toLowerCase() === currentAccount.toLowerCase();
  const [showDonors, setShowDonors] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // Lưu ảnh vào localStorage nếu chưa có
  useEffect(() => {
    const localImage = localStorage.getItem(`project-image-${project.id}`);
    if (localImage) {
      setImageUrl(localImage);
    } else if (project.imageUrl && project.imageUrl.trim() !== "") {
      localStorage.setItem(`project-image-${project.id}`, project.imageUrl);
      setImageUrl(project.imageUrl);
    } else {
      setImageUrl("https://via.placeholder.com/300x200.png?text=Không+Có+Ảnh");
    }
  }, [project.id, project.imageUrl]);

  const onEndProject = async () => {
    if (!walletConnected) {
      alert("Vui lòng kết nối ví MetaMask");
      return;
    }
    if (!isCreator) {
      alert("Chỉ người tạo dự án mới có thể kết thúc");
      return;
    }
    await handleEndProject(project.id);
  };

  return (
    <div className="project-card">
      <img src={imageUrl} alt={project.name} className="project-image" />
      <div className="project-content">
        <h3 className="project-title">{project.name}</h3>
        <p className="project-description">{project.description}</p>

        <div className="project-info">
          <p>
            Danh mục:{" "}
            <span className="project-category">{project.category}</span>
          </p>
          <p>
            Tổng quyên góp:{" "}
            <span className="project-amount">{project.totalDonated} ETH</span>
          </p>
          <p>
            Trạng thái:{" "}
            <span
              className={
                project.active
                  ? "project-status-active"
                  : "project-status-ended"
              }
            >
              {project.active ? "Đang Hoạt Động" : "Đã Kết Thúc"}
            </span>
          </p>
          <p>
            Người tạo:{" "}
            <span className="project-creator">{project.creator}</span>
          </p>
        </div>

        <div className="project-actions">
          <button
            onClick={() => setShowDonors(true)}
            className="project-button project-button-donors"
          >
            Xem Người Quyên Góp
          </button>

          {project.active && (
            <div className="project-donation">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Số ETH quyên góp"
                className="project-input"
                disabled={!walletConnected}
              />
              <button
                onClick={() => handleDonate(project.id)}
                className="project-button project-button-donate"
                disabled={
                  !walletConnected ||
                  !donationAmount ||
                  parseFloat(donationAmount) <= 0
                }
              >
                Quyên Góp
              </button>
            </div>
          )}

          {project.active && isCreator && (
            <button
              onClick={onEndProject}
              className="project-button project-button-end"
              disabled={!walletConnected}
            >
              Kết Thúc Dự Án
            </button>
          )}
        </div>
      </div>

      {showDonors && (
        <DonorList
          projectId={project.id}
          contract={contract}
          onClose={() => setShowDonors(false)}
        />
      )}
    </div>
  );
};

export default ProjectCard;
