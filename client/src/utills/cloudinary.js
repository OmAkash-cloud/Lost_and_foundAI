export const uploadImageToCloudinary = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "lost_found_upload");
  
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dfok4oo4o/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );
  
    const data = await response.json();
  
    if (!data.secure_url) {
      throw new Error("Cloudinary upload failed");
    }
  
    return data.secure_url;
  };
  