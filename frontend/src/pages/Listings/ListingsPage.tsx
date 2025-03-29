/*
import React from "react";
import { Box, Typography } from "@mui/material";

const ListingsPage: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Listings
      </Typography>
      <Typography variant="body1">
        This is where your listing info will appear.
      </Typography>
    </Box>
  );
};

export default ListingsPage;
*/

import React from "react";
import { Box, Typography } from "@mui/material";
import ImageUploader from "../../features/images/components/ImageUploader";
import { useImageUploader } from "../../features/images/hooks/useImageUploader";

const ListingsPage: React.FC = () => {
  const {
    file,
    previewUrl,
    handleFileChange,
    reset,
  } = useImageUploader();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Listings
      </Typography>

      <ImageUploader
        previewUrl={previewUrl ?? undefined}
        onFileInput={handleFileChange}
        onRemove={reset}
        label="Upload a photo"
        width={300}
        height={200}
      />

      {/* Debug display, or future upload button */}
      {file && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Selected file: {file.name}
        </Typography>
      )}
    </Box>
  );
};

export default ListingsPage;
