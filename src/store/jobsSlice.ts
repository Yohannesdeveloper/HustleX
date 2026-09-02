import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { JobType } from "../types";

export interface JobsState {
  jobs: JobType[];
  totalJobsCount: number;
}

const initialState: JobsState = {
  jobs: [],
  totalJobsCount: 0,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<JobType[]>) {
      state.jobs = action.payload;
    },
    setTotalJobsCount(state, action: PayloadAction<number>) {
      state.totalJobsCount = action.payload;
    },
    addJob(state, action: PayloadAction<Omit<JobType, "id">>) {
      const newJob = {
        ...action.payload,
        id: Date.now().toString(),
      } as JobType;
      state.jobs.unshift(newJob);
      state.totalJobsCount += 1;
    },
    clearJobs(state) {
      state.jobs = [];
      state.totalJobsCount = 0;
    },
  },
});

export const { setJobs, setTotalJobsCount, addJob, clearJobs } = jobsSlice.actions;
export default jobsSlice.reducer;

