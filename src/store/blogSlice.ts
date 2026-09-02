import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface BlogState {
    totalBlogsCount: number;
}

const initialState: BlogState = {
    totalBlogsCount: 0,
};

const blogSlice = createSlice({
    name: "blog",
    initialState,
    reducers: {
        setTotalBlogsCount(state, action: PayloadAction<number>) {
            state.totalBlogsCount = action.payload;
        },
        incrementBlogCount(state) {
            state.totalBlogsCount += 1;
        },
        decrementBlogCount(state) {
            if (state.totalBlogsCount > 0) {
                state.totalBlogsCount -= 1;
            }
        },
    },
});

export const { setTotalBlogsCount, incrementBlogCount, decrementBlogCount } = blogSlice.actions;
export default blogSlice.reducer;
