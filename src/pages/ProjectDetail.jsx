import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import DonateForm from "../components/DonateForm";
import "./ProjectDetail.css";

const ProjectDetail = ({
  projects,
  handleDonate,
  handleEndProject,
  user,
  currentAccount,
  walletConnected,
  contract,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = parseInt(id);
  const project = projects.find((p) => p.id === projectId);

  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [donationError, setDonationError] = useState("");

  const fetchDonations = async () => {
    if (!contract) {
      setDonationError("Hợp đồng thông minh chưa được khởi tạo");
      setLoadingDonations(false);
      return;
    }
    setLoadingDonations(true);
    setDonationError("");
    try {
      const donationList = await contract.getProjectDonations(projectId);
      const formattedDonations = donationList.map((d) => ({
        donor: d.donor,
        message: d.message,
        isAnonymous: d.isAnonymous,
        donorName: d.donorName,
        amount: ethers.formatEther(d.amount),
        timestamp: new Date(Number(d.timestamp) * 1000).toLocaleString(),
      }));
      setDonations(formattedDonations);
    } catch (err) {
      console.error(`Error fetching donations for project ${projectId}:`, err);
      setDonationError(
        "Không thể tải danh sách quyên góp: " + (err.reason || err.message)
      );
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    if (!project) {
      navigate("/");
      return;
    }
    fetchDonations();
  }, [project, contract, navigate]);

  if (!project) return null;

  return (
    <div className="project-detail">
      <button onClick={() => navigate("/")} className="back-button">
        Quay lại
      </button>
      <div className="project-header">
        {project.imageUrl && (
          <img
            src={project.imageUrl}
            alt={project.name}
            className="project-image"
          />
        )}
        <div className="project-info">
          <h1>{project.name}</h1>
          <p>
            <strong>Danh mục:</strong> {project.category}
          </p>
          <p>
            <strong>Tổng quyên góp:</strong> {project.totalDonated} ETH
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {project.active ? "Đang hoạt động" : "Đã kết thúc"}
          </p>
          <p>
            <strong>Người tạo:</strong> {project.creator}
          </p>
        </div>
      </div>
      <div className="project-description">
        <h2>Mô tả dự án</h2>
        <p>{project.description}</p>
      </div>
      {project.active && (
        <div className="donate-section">
          <h2>Quyên góp</h2>
          <DonateForm
            projectId={project.id}
            handleDonate={handleDonate}
            walletConnected={walletConnected}
          />
        </div>
      )}
      {user &&
        currentAccount &&
        currentAccount.toLowerCase() === project.creator.toLowerCase() &&
        project.active && (
          <button
            onClick={() => handleEndProject(project.id)}
            className="end-project-button"
          >
            Kết thúc dự án
          </button>
        )}
      <div className="donation-list">
        <h2>Danh sách quyên góp</h2>
        {loadingDonations && <p>Đang tải danh sách quyên góp...</p>}
        {donationError && <p className="error-text">{donationError}</p>}
        {!loadingDonations && !donationError && donations.length > 0
          ? donations.map((donation, index) => (
              <div key={index} className="donation-item">
                <div className="donation-header">
                  <span className="donor-icon">
                    {donation.isAnonymous ? "👤" : "🧑"}
                  </span>
                  <strong>
                    {donation.isAnonymous
                      ? "Ẩn danh"
                      : donation.donorName || donation.donor}
                  </strong>
                </div>
                <p className="donation-message">
                  {donation.message || "Không có lời nhắn"}
                </p>
                <p>Số tiền: {donation.amount} ETH</p>
                <p>Thời gian: {donation.timestamp}</p>
              </div>
            ))
          : !loadingDonations && <p>Chưa có quyên góp nào.</p>}
      </div>
    </div>
  );
};

export default ProjectDetail;
