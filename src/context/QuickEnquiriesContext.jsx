// Deprecated: Dead code. Quick enquiries are now integrated directly into the leads flow.
import React, { createContext } from 'react';
export const QuickEnquiriesContext = createContext(null);
export const QuickEnquiriesProvider = ({ children }) => <>{children}</>;
export const useQuickEnquiries = () => ({ enquiries: [], loading: false, fetchEnquiries: () => {} });
