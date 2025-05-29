import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './DonorList.css';


const DonorList = ({ projectId, contract, onClose }) => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonors = async () => {
      if (!contract) {
        setError('Hợp đồng thông minh chưa được khởi tạo');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [donorAddresses, amounts] = await contract.getProjectDonors(projectId);
        const donorList = donorAddresses.map((address, index) => ({
          address,
          amount: ethers.formatEther(amounts[index])
        }));
        setDonors(donorList);
        setError('');
      } catch (err) {
        console.error('Error fetching donors:', err);
        setError('Lỗi khi lấy danh sách người quyên góp: ' + (err.reason || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, [projectId, contract]);

  return (
    <div className="donor-modal">
        <div className="donor-content">
            <h3 className="donor-title">Danh Sách Người Quyên Góp</h3>
            {error && <p className="donor-error">{error}</p>}
            {loading ? (
            <p className="donor-loading">Đang tải...</p>
            ) : donors.length === 0 ? (
            <p>Chưa có người quyên góp.</p>
            ) : (
            <ul className="donor-list">
                {donors.map((donor, index) => (
                <li key={index} className="donor-item">
                    <span>Địa chỉ:</span> {donor.address} <br />
                    <span>Số tiền:</span> {donor.amount} ETH
                </li>
                ))}
            </ul>
            )}
            <button onClick={onClose} className="donor-close-btn">Đóng</button>
        </div>
        </div>
  );
};

export default DonorList;