import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Employee {
  id: number;
  name: string;
  role: string;
  phone: string;
  email: string;
}

interface EmployeesState {
  showModal: boolean;
  modalMode: 'view' | 'edit';
  selectedEmployee: Employee | null;
  editForm: Partial<Employee>;
  modalLoading: boolean;
  modalError: string | null;
  deleteLoading: boolean;
}

const initialState: EmployeesState = {
  showModal: false,
  modalMode: 'view',
  selectedEmployee: null,
  editForm: {},
  modalLoading: false,
  modalError: null,
  deleteLoading: false,
};

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setShowModal(state, action: PayloadAction<boolean>) {
      state.showModal = action.payload;
    },
    setModalMode(state, action: PayloadAction<'view' | 'edit'>) {
      state.modalMode = action.payload;
    },
    setSelectedEmployee(state, action: PayloadAction<Employee | null>) {
      state.selectedEmployee = action.payload;
    },
    setEditForm(state, action: PayloadAction<Partial<Employee>>) {
      state.editForm = action.payload;
    },
    setModalLoading(state, action: PayloadAction<boolean>) {
      state.modalLoading = action.payload;
    },
    setModalError(state, action: PayloadAction<string | null>) {
      state.modalError = action.payload;
    },
    setDeleteLoading(state, action: PayloadAction<boolean>) {
      state.deleteLoading = action.payload;
    },
    resetEmployeesModal(state) {
      state.showModal = false;
      state.modalMode = 'view';
      state.selectedEmployee = null;
      state.editForm = {};
      state.modalLoading = false;
      state.modalError = null;
      state.deleteLoading = false;
    },
  },
});

export const {
  setShowModal,
  setModalMode,
  setSelectedEmployee,
  setEditForm,
  setModalLoading,
  setModalError,
  setDeleteLoading,
  resetEmployeesModal,
} = employeesSlice.actions;

export default employeesSlice.reducer;
