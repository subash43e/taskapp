import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	taskName: '',
	description: '',
	dueDate: '',
	priority: '',
	category: '',
	project: '',
};

const taskCreationSlice = createSlice({
	name: 'taskCreation',
	initialState,
	reducers: {
		setTaskName(state, action) {
			state.taskName = action.payload;
		},
		setDescription(state, action) {
			state.description = action.payload;
		},
		setDueDate(state, action) {
			state.dueDate = action.payload;
		},
		setPriority(state, action) {
			state.priority = action.payload;
		},
		setCategory(state, action) {
			state.category = action.payload;
		},
		setProject(state, action) {
			state.project = action.payload;
		},
		resetTaskForm(state) {
			Object.assign(state, initialState);
		},
	},
});

export const {
	setTaskName,
	setDescription,
	setDueDate,
	setPriority,
	setCategory,
	setProject,
	resetTaskForm,
} = taskCreationSlice.actions;

export default taskCreationSlice.reducer;
