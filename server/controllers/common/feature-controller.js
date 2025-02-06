const Feature = require("../../models/Feature");


const deleteFeatureImage = async (req, res) => {
  try {
    const { id } = req.body; // Get the image ID from the request body

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "No image ID provided",
      });
    }

    // Find and delete the feature image by its ID
    const deletedImage = await Feature.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error deleting the feature image",
    });
  }
};

module.exports = { deleteFeatureImage };



const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages ,deleteFeatureImage};
