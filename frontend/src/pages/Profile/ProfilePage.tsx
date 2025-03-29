import {
    Box,
    Button,
    TextField,
    Typography
  } from "@mui/material";
  import { useState, useRef } from "react";
  import { useAvatarUploader } from "../../features/images/hooks/useAvatarUploader";
  import AvatarUploader from "../../features/images/components/AvatarUploader";
  import PersonIcon from "@mui/icons-material/Person";
  import { Link as RouterLink } from "react-router-dom";
  
  export default function ProfilePage() {
    const [bio, setBio] = useState("");
    const [interests, setInterests] = useState("");
  
    const {
      file: imageFile,
      previewUrl: image,
      handleFileChange,
      // reset
    } = useAvatarUploader();
  
    const cameraRef = useRef<HTMLButtonElement>(null);

    return (
      <Box sx={{ maxWidth: 600, mx: "auto", mt: 5, textAlign: "center" }}>
        <Typography variant="h2" gutterBottom>
          Profile Page
        </Typography>
  
        <AvatarUploader
          label="Upload Profile Picture"
          labelVisibility = 'hover'
          labelHoverTargetRef={cameraRef as React.RefObject<HTMLElement>}
          previewUrl={image ?? undefined}
          onFileInput={handleFileChange}
          size={120}
          labelSx={{  // not strictly necessary because this is current default
            position: "absolute",
            bottom: -25,
            left: "50%",
            transform: "translateX(-50%)",
            opacity: 1,
            whiteSpace: "nowrap",
          }}
          fallback={<PersonIcon sx={{ fontSize: 80 }} />}
        />
  
        <Box sx={{ textAlign: "left" }}>
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={4}
            variant="outlined"
            margin="normal"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
  
          <TextField
            fullWidth
            label="Interests"
            placeholder="e.g. AI, Music, Hiking"
            variant="outlined"
            margin="normal"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Box>
  
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            console.log("Saved:", {
              imageFile,
              imagePreview: image,
              bio,
              interests
            });
            alert("Profile saved!");
          }}
        >
          Save Profile
        </Button>

        <Button
          component={RouterLink}
          to="/listings"
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Go to your listings
        </Button>
      </Box>
    );
  }