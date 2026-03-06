import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { JobType } from "../types";

export interface JobsState {
  jobs: JobType[];
}

const initialState: JobsState = {
  jobs: [],
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<JobType[]>) {
      state.jobs = action.payload;
    },
    addJob(state, action: PayloadAction<Omit<JobType, "id">>) {
      const newJob = {
        ...action.payload,
        id: Date.now().toString(),
      } as JobType;
      state.jobs.unshift(newJob);
    },
    clearJobs(state) {
      state.jobs = [];
    },
  },
});

export const { setJobs, addJob, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;

