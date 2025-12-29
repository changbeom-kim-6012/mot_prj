'use client';

import { useState } from 'react';
import { FiMessageSquare, FiList } from 'react-icons/fi';
import InquiryModal from './InquiryModal';
import InquiryListModal from './InquiryListModal';

interface InquiryButtonsProps {
  refTable: string;
  refId: number;
  refTitle: string;
  userEmail?: string;
  className?: string;
}

export default function InquiryButtons({
  refTable,
  refId,
  refTitle,
  userEmail,
  className = ''
}: InquiryButtonsProps) {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryListModalOpen, setInquiryListModalOpen] = useState(false);

  if (!userEmail) return null;

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => setInquiryModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <FiMessageSquare className="mr-2 h-4 w-4" />
          관련 문의/요청
        </button>
        <button
          onClick={() => setInquiryListModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiList className="mr-2 h-4 w-4" />
          문의/요청 이력
        </button>
      </div>

      {inquiryModalOpen && (
        <InquiryModal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          refTable={refTable}
          refId={refId}
          refTitle={refTitle}
          userEmail={userEmail}
        />
      )}

      {inquiryListModalOpen && (
        <InquiryListModal
          isOpen={inquiryListModalOpen}
          onClose={() => setInquiryListModalOpen(false)}
          refTable={refTable}
          refId={refId}
          refTitle={refTitle}
          userEmail={userEmail}
        />
      )}
    </>
  );
}

