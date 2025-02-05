import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  Card,
  CardActions,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import axios from "axios";
import "katex/dist/katex.min.css";
import MarkdownWithMath from "./Markdown";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

type AnswerLength = "short" | "medium" | "large";

const App: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [answerLength, setAnswerLength] = useState<AnswerLength>("medium");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedLanguage = localStorage.getItem("selectedLanguage");
    const storedAnswerLength = localStorage.getItem("answerLength");

    if (storedLanguage) setSelectedLanguage(storedLanguage);
    if (storedAnswerLength) setAnswerLength(storedAnswerLength as AnswerLength);
  }, []);

  // Save settings when they change
  useEffect(() => {
    localStorage.setItem("selectedLanguage", selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem("answerLength", answerLength);
  }, [answerLength]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("language", selectedLanguage);
      formData.append("file", file);
      formData.append("size", answerLength);

      const submitResponse = await fetch(`${apiBaseUrl}/OcrChat/Submit`, {
        method: "POST",
        body: formData,
      });

      if (!submitResponse.ok) {
        throw new Error("Failed to submit request");
      }

      const submitData = await submitResponse.json();
      const { requestId } = submitData;

      let pollResult: string | null = null;
      while (!pollResult) {
        try {
          await sleep(2000);
          const response = await axios.get(`${apiBaseUrl}/OcrChat/Result/${requestId}`);
          pollResult = response.data;
        } catch {
          console.log("Retrying request...");
        }
      }

      setResult(pollResult);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#121212",
        minHeight: "100vh",
        color: "#ffffff",
      }}
    >
      <Container maxWidth="sm" sx={{ pt: 4 }}>
        <Card sx={{ p: 3, boxShadow: 5, borderRadius: 3, backgroundColor: "#2c2c2c", color: "#ffffff" }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#ffffff" }}>
            Solve me!
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: "lightgray", mb: 3 }}>
            Capture or upload an image and get AI-generated insights.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Language Selector */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="language-label" sx={{ color: "gray" }}>Select Language</InputLabel>
              <Select
                labelId="language-label"
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                sx={{
                  color: "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                }}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ru">Russian</MenuItem>
                <MenuItem value="ua">Ukrainian</MenuItem>
              </Select>
            </FormControl>

            {/* Answer Length Selector */}
            <FormControl fullWidth margin="normal">
              <InputLabel id="answer-length-label" sx={{ color: "gray" }}>Answer Length</InputLabel>
              <Select
                labelId="answer-length-label"
                id="answer-length"
                value={answerLength}
                onChange={(e) => setAnswerLength(e.target.value as AnswerLength)}
                sx={{
                  color: "#ffffff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "gray" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                }}
              >
                <MenuItem value="short">Short</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>

            {/* File Upload */}
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{
                mt: 2,
                backgroundColor: "#3f51b5",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#303f9f" },
              }}
              startIcon={file ? <UploadFileIcon /> : <PhotoCameraIcon />}
            >
              {file ? "Change Photo" : "Select Photo / Take a Photo"}
              <input type="file" accept="image/*" capture="environment" hidden onChange={handleFileChange} />
            </Button>

            {file && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic", color: "lightgray" }}>
                Selected file: {file.name}
              </Typography>
            )}

            {/* Submit Button */}
            <CardActions>
              <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, backgroundColor: "#6200ea", "&:hover": { backgroundColor: "#3700b3" } }} disabled={loading}>
                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Submit"}
              </Button>
            </CardActions>
          </Box>
        </Card>

        {/* Result Card */}
        {result && (
          <Card sx={{ mt: 4, p: 3, boxShadow: 3, borderRadius: 3, backgroundColor: "#2c2c2c", color: "#ffffff" }}>
            <Typography variant="h6">Result:</Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", mt: 1 }}>
              {result && <MarkdownWithMath markdownContent={result} />}
            </Typography>
          </Card>
        )}
      </Container>
    </main>
  );
};

export default App;
