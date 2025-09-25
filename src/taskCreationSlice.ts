import { createSlice } from '@reduxjs/toolkit';

const defaultCategories = ["Personal", "Work", "Shopping", "Personal Development"];
const defaultTags = ["Important", "Urgent", "Review", "Meeting", "Call", "Email", "Follow-up"];

const initialState = {
	taskName: '',
	description: '',
	dueDate: '',
	dueTime: '', // Add time field
	priority: '',
	category: '',
	project: '',
	color: '#2196f3', // default color
	tags: [] as string[], // Initialize tags as an empty array
	
	// Form state
	tagInput: '',
	categoryInput: '',
	showCategorySuggestions: false,
	showTagSuggestions: false,
	
	// Available options
	availableCategories: defaultCategories,
	availableTags: defaultTags,
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
		setDueTime(state, action) {
			state.dueTime = action.payload;
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
        setTags(state, action) {
            // Filter out empty strings and duplicates
            const uniqueTags = Array.isArray(action.payload) 
                ? [...new Set(action.payload.filter(tag => typeof tag === 'string' && tag.trim() !== ''))]
                : [];
            state.tags = uniqueTags;
        },
        addTag(state, action) {
            const tag = action.payload?.trim();
            // Only add non-empty tags that don't already exist (case insensitive)
            if (tag && !state.tags.some(existingTag => 
                existingTag.toLowerCase() === tag.toLowerCase())
            ) {
                state.tags.push(tag);
            }
        },
        removeTag(state, action) {
            state.tags = state.tags.filter(tag => tag !== action.payload);
        },
        clearAllTags(state) {
            state.tags = [];
        },
        addMultipleTags(state, action) {
            // Filter and validate each tag before adding
            if (Array.isArray(action.payload)) {
                const newTags = action.payload
                    .filter(tag => typeof tag === 'string' && tag.trim() !== '')
                    .map(tag => tag.trim());
                
                // Only add unique tags (case insensitive)
                newTags.forEach(newTag => {
                    if (!state.tags.some(existingTag => 
                        existingTag.toLowerCase() === newTag.toLowerCase())
                    ) {
                        state.tags.push(newTag);
                    }
                });
            }
        },
        // Form state reducers
        setTagInput(state, action) {
            state.tagInput = action.payload;
        },
        setCategoryInput(state, action) {
            state.categoryInput = action.payload;
            state.category = action.payload; // Keep category in sync
        },
        setShowCategorySuggestions(state, action) {
            state.showCategorySuggestions = action.payload;
        },
        setShowTagSuggestions(state, action) {
            state.showTagSuggestions = action.payload;
        },
        // Category management
        addCategory(state, action) {
            const category = action.payload?.trim();
            if (category && !state.availableCategories.some(existingCat => 
                existingCat.toLowerCase() === category.toLowerCase())
            ) {
                state.availableCategories.push(category);
            }
        },
        addAvailableTag(state, action) {
            const tag = action.payload?.trim();
            if (tag && !state.availableTags.some(existingTag => 
                existingTag.toLowerCase() === tag.toLowerCase())
            ) {
                state.availableTags.push(tag);
            }
        },
        selectCategory(state, action) {
            const category = action.payload;
            state.categoryInput = category;
            state.category = category;
            state.showCategorySuggestions = false;
        },
        selectTag(state, action) {
            const tag = action.payload;
            if (tag && !state.tags.some(existingTag => 
                existingTag.toLowerCase() === tag.toLowerCase())
            ) {
                state.tags.push(tag);
                // Add to available tags if it's new
                if (!state.availableTags.some(t => t.toLowerCase() === tag.toLowerCase())) {
                    state.availableTags.push(tag);
                }
            }
            state.tagInput = '';
            state.showTagSuggestions = false;
        },
		resetTaskForm(state) {
			// Reset task data while preserving available categories and tags
			const availableCats = [...state.availableCategories];
			const availableTags = [...state.availableTags];
			
			return {
				...initialState,
				tags: [], // Fresh tags array
				availableCategories: availableCats, // Preserve user-added categories
				availableTags: availableTags, // Preserve user-added tags
			};
		},
		saveTaskLocally(state) {
			const task = {
				taskName: state.taskName,
				description: state.description,
				dueDate: state.dueDate,
				dueTime: state.dueTime,
				priority: state.priority,
				category: state.category,
				project: state.project,
				tags: state.tags,
				color: state.color,
				savedAt: new Date().toISOString(),
			};

			try {
				localStorage.setItem('savedTask', JSON.stringify(task));
			} catch (error) {
				// Handle potential errors (e.g., localStorage full, private browsing mode)
				console.error('Failed to save task to localStorage:', error);
			}
		}
	},
});

export const {
	setTaskName,
	setDescription,
	setDueDate,
	setDueTime,
	setPriority,
	setCategory,
	setProject,
	setColor,
	setTags,
	addTag,
	removeTag,
	clearAllTags,
	addMultipleTags,
	resetTaskForm,
	// New form state actions
	setTagInput,
	setCategoryInput,
	setShowCategorySuggestions,
	setShowTagSuggestions,
	addCategory,
	addAvailableTag,
	selectCategory,
	selectTag,
} = taskCreationSlice.actions;

export default taskCreationSlice.reducer;