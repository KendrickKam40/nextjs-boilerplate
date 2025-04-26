// components/LoyaltyDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Modal from './Modal';

interface LoyaltyDashboardProps {
  /** Current user points */
  currentPoints: number;
  /** Points needed to reach next tier/milestone */
  nextTier: number;
  /** Handler when redeem button is clicked */
  onRedeem: () => void;
}

/**
 * Displays a horizontal progress bar toward the next reward tier,
 * allows redeeming points, and shows a milestone modal.
 */
const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({
  currentPoints,
  nextTier,
  onRedeem,
}) => {
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);

  // Calculate progress percentage (capped at 100%)
  const progress = Math.min((currentPoints / nextTier) * 100, 100);

  useEffect(() => {
    // When user hits or exceeds the milestone, show popup once
    if (currentPoints >= nextTier) {
      setShowMilestoneModal(true);
    }
  }, [currentPoints, nextTier]);

  return (
    <div className="flex flex-col items-stretch space-y-4 p-4 bg-[#F2EAE2] rounded-2xl shadow-md">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">Points: {currentPoints}</span>
        <span className="text-sm text-gray-500">/ {nextTier}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-lg h-4 overflow-hidden">
        <div
          className="h-full bg-[#F33550] transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600">{Math.max(nextTier - currentPoints, 0)} points until your next reward</p>
      {/* <button
        onClick={onRedeem}
        className="px-4 py-2 bg-[#F33550] text-white rounded-lg font-semibold cursor-pointer"
      >
        Redeem Points
      </button> */}

      {/* Milestone Modal */}
      <Modal
        open={showMilestoneModal}
        title="Congrats!"
        bgColor="#FFFFFF"
        textColor="#000000"
        width="300px"
        onClose={() => setShowMilestoneModal(false)}
      >
        <p>You’ve reached {nextTier} points—enjoy a free dessert!</p>
      </Modal>
    </div>
  );
};

export default LoyaltyDashboard;