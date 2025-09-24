import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	taskName: '',
	description: '',
	dueDate: '',
	priority: '',
	category: '',
	project: '',
	color: '#2196f3', // default color
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
        setColor(state, action) {
            state.color = action.payload;
        },
		resetTaskForm(state) {
			Object.assign(state, initialState);
		},
		saveTaskLocally(state) {
			const task = {
				taskName: state.taskName,
				description: state.description,
				dueDate: state.dueDate,
				priority: state.priority,
				category: state.category,
				project: state.project,
			};

			localStorage.setItem('savedTask', JSON.stringify(task));
		}
	},
});

export const {
	setTaskName,
	setDescription,
	setDueDate,
	setPriority,
	setCategory,
	setProject,
	setColor,
	resetTaskForm,
} = taskCreationSlice.actions;

export default taskCreationSlice.reducer;