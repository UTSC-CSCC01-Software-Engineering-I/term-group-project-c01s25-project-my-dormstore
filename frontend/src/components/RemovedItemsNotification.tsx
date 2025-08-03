import React from 'react';
import './RemovedItemsNotification.css';

interface RemovedItemsNotificationProps {
  removedItems: Array<{ name: string; reason: string }>;
  onClose: () => void;
}

export const RemovedItemsNotification: React.FC<RemovedItemsNotificationProps> = ({
  removedItems,
  onClose
}) => {
  if (removedItems.length === 0) return null;

  return (
    <div className="removed-items-notification">
      <div className="removed-items-header">
        <h3>🛒 Items Removed from Cart</h3>
        <button className="removed-items-close" onClick={onClose}>×</button>
      </div>
      
      <div className="removed-items-body">
        <p className="removed-items-intro">
          The following items were automatically removed from your cart:
        </p>
        
        <div className="removed-items-list">
          {removedItems.map((item, index) => (
            <div key={index} className="removed-item">
              <div className="removed-item-name">{item.name}</div>
              <div className="removed-item-reason">{item.reason}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="removed-items-footer">
        <button className="removed-items-ok-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}; 