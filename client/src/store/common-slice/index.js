import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

const baseUrl = import.meta.env.MODE === 'production' 
  ? import.meta.env.VITE_API_URL_PROD 
  : import.meta.env.VITE_API_URL_DEV;

export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async () => {
    const response = await axios.get(
      `${baseUrl}/api/common/feature/get`
    );
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (image) => {
    const response = await axios.post(
      `${baseUrl}/api/common/feature/add`,
      { image }
    );
    return response.data;
  }
);


export const deleteFeatureImage = createAsyncThunk(
  "/order/deleteFeatureImage",
  async (imageId, { dispatch }) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/api/common/feature/delete`,
        { data: { id: imageId } } 
      );

      if (response.data.success) {
        return imageId;
      }

      throw new Error('Failed to delete the image');
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }
);

const commonSlice = createSlice({
  name: "commonSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeatureImages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getFeatureImages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featureImageList = action.payload.data;
      })
      .addCase(getFeatureImages.rejected, (state) => {
        state.isLoading = false;
        state.featureImageList = [];
      })
      .addCase(deleteFeatureImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteFeatureImage.fulfilled, (state, action) => {
        // Remove the deleted image from the featureImageList based on the imageId
        state.featureImageList = state.featureImageList.filter(
          (image) => image._id !== action.payload // Filter out the deleted image
        );
      })
      .addCase(deleteFeatureImage.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default commonSlice.reducer;
