import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  autoClose?: boolean;
  duration?: number;
}

interface UIState {
  sidebarOpen: boolean;
  sidebarMiniMode: boolean;
  activeView: 'grid' | 'list' | 'details';
  selectedItems: string[];
  searchQuery: string;
  notifications: Notification[];
  modalOpen: {
    [key: string]: boolean;
  };
  isLoading: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  sidebarMiniMode: false,
  activeView: 'grid',
  selectedItems: [],
  searchQuery: '',
  notifications: [],
  modalOpen: {
    createFolder: false,
    uploadFile: false,
    shareItem: false,
    deleteConfirm: false,
    aiTool: false,
    settings: false,
  },
  isLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarMode: (state) => {
      state.sidebarMiniMode = !state.sidebarMiniMode;
    },
    setActiveView: (state, action: PayloadAction<'grid' | 'list' | 'details'>) => {
      state.activeView = action.payload;
    },
    setSelectedItems: (state, action: PayloadAction<string[]>) => {
      state.selectedItems = action.payload;
    },
    addSelectedItem: (state, action: PayloadAction<string>) => {
      if (!state.selectedItems.includes(action.payload)) {
        state.selectedItems.push(action.payload);
      }
    },
    removeSelectedItem: (state, action: PayloadAction<string>) => {
      state.selectedItems = state.selectedItems.filter(id => id !== action.payload);
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setModalOpen: (
      state,
      action: PayloadAction<{ modal: string; isOpen: boolean }>
    ) => {
      const { modal, isOpen } = action.payload;
      state.modalOpen[modal] = isOpen;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarMode,
  setActiveView,
  setSelectedItems,
  addSelectedItem,
  removeSelectedItem,
  clearSelectedItems,
  setSearchQuery,
  addNotification,
  removeNotification,
  clearNotifications,
  setModalOpen,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
