import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  featureImageList: [],
};

export const getFeatureImages = createAsyncThunk(
  "/order/getFeatureImages",
  async () => {
    const response = await axios.get(
      `http://localhost:5000/api/common/feature/get`
    );
    return response.data;
  }
);

export const addFeatureImage = createAsyncThunk(
  "/order/addFeatureImage",
  async (image) => {
    const response = await axios.post(
      `http://localhost:5000/api/common/feature/add`,
      { image }
    );
    return response.data;
  }
);

// Add delete feature image thunk
export const deleteFeatureImage = createAsyncThunk(
  "/order/deleteFeatureImage",
  async (imageId, { dispatch }) => {
    try {
      // Send the image ID for deletion
      const response = await axios.delete(
        "http://localhost:5000/api/common/feature/delete",
        { data: { id: imageId } } // Pass the image ID as 'id'
      );

      if (response.data.success) {
        // After successful deletion, return the imageId to remove it from the local state
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
