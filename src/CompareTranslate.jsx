import React, { useState } from "react";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import Select from "react-select";

const CompareTranslate = ({ temperatureValue, setTemperatureValue }) => {
  const [selectedModels, setSelectedModels] = useState([]);
  const [error, setError] = useState("");
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceLanguage: "english",
    destinationLanguage: "french",
    message: "",
  });

  const models = {
    "gpt-4o-mini": "gpt-4o-mini",
    "gemini-pro": "gemini-1.5-pro-latest",
    "gemini-flash": "gemini-1.5-flash-latest",
    deepl: "deepl",
  };

  const languageOptions = [
    { value: "arabic", label: "Arabic" },
    { value: "dutch", label: "Dutch" },
    { value: "english", label: "English" },
    { value: "farsi", label: "Farsi" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "greek", label: "Greek" },
    { value: "hebrew", label: "Hebrew" },
    { value: "hindi", label: "Hindi" },
    { value: "italian", label: "Italian" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "mandarin", label: "Mandarin" },
    { value: "polish", label: "Polish" },
    { value: "portuguese", label: "Portuguese" },
    { value: "russian", label: "Russian" },
    { value: "spanish", label: "Spanish" },
    { value: "swedish", label: "Swedish" },
    { value: "thai", label: "Thai" },
    { value: "turkish", label: "Turkish" },
    { value: "vietnamese", label: "Vietnamese" },
    { value: "yiddish", label: "Yiddish" },
  ];

  const handleModelChange = (model, isChecked) => {
    const updatedModels = isChecked
      ? [...selectedModels, model]
      : selectedModels.filter((m) => m !== model);
    setSelectedModels(updatedModels);
  };

  const processTranslations = (translationsData) => {
    const groups = translationsData.reduce((acc, item) => {
      const evaluation = JSON.parse(item.evaluation);
      const key = item.inputText;
      if (!acc[key]) {
        acc[key] = { models: {} };
      }
      if (!acc[key].models[item.inputModel]) {
        acc[key].models[item.inputModel] = { details: [] };
      }
      acc[key].models[item.inputModel].details.push({
        score: evaluation.score,
        translation: item.outputText,
        modelName: item.inputModel,
      });
      return acc;
    }, {});

    // Calculate average scores and store details
    Object.values(groups).forEach((group) => {
      Object.entries(group.models).forEach(([modelName, modelData]) => {
        const totalScore = modelData.details.reduce(
          (sum, detail) => sum + detail.score,
          0
        );
        const averageScore = totalScore / modelData.details.length;
        group.models[modelName].average = averageScore;
      });
    });

    return Object.entries(groups).map(([inputText, data]) => ({
      inputText,
      models: Object.entries(data.models)
        .map(([modelName, modelData]) => ({
          modelName,
          average: modelData.average,
          details: modelData.details,
        }))
        .sort((a, b) => b.average - a.average),
    }));
  };

  const CompareTranslateResponses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8800/compareTranslate", {
        message: formData.message,
        sourceLanguage: formData.sourceLanguage,
        destinationLanguage: formData.destinationLanguage,
        temperatureValue,
        selectedModels,
      });

      const processedData = processTranslations(res.data.validatedTranslations);
      setEvaluationResults(processedData);
      setError(""); 
    } catch (err) {
      setError("An error occurred while fetching translations.");
      console.error("Error fetching translations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.message) {
      setError("Please enter the message.");
      return;
    }
    const wordCount = formData.message.trim().split(/\s+/).length;
    if (wordCount > 40) {
      setError("The message must be less than 40 words.");
      return;
    }
    if (selectedModels.length === 0) {
      setError("Please select at least one model for comparison.");
      return;
    }
    CompareTranslateResponses();
  };

  return (
    <div className="container">
      <h1>Compare Translations</h1>
      <form onSubmit={handleSubmit}>
        <div className="translation-options">
          <Select
            name="sourceLanguage"
            options={languageOptions}
            onChange={(selectedOption) =>
              handleInputChange({ target: { name: "sourceLanguage", value: selectedOption.value } })
            }
            defaultValue={languageOptions.find(option => option.value === formData.sourceLanguage)}
          />
          <Select
            name="destinationLanguage"
            options={languageOptions}
            onChange={(selectedOption) =>
              handleInputChange({ target: { name: "destinationLanguage", value: selectedOption.value } })
            }
            defaultValue={languageOptions.find(option => option.value === formData.destinationLanguage)}
          />
        </div>
        <textarea
          name="message"
          onChange={handleInputChange}
          placeholder="Enter text to translate"
        />
        <div className="modelChoices">
          {Object.entries(models).map(([key, value]) => (
            <div key={key}>
              <input
                type="checkbox"
                id={key}
                value={value}
                onChange={(e) => handleModelChange(value, e.target.checked)}
              />
              <label htmlFor={key}>{key}</label>
            </div>
          ))}
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="submitButton">
          Evaluate
        </button>
      </form>
      {isLoading ? <BeatLoader size={12} color={"red"} /> : null}
      {evaluationResults.length > 0 && (
        <div className="results">
          <table>
            <thead>
              <tr>
                <th>Input Text</th>
                <th>Model Name</th>
                <th>Avg Score /10</th>
                <th>Translation</th>
              </tr>
            </thead>
            <tbody>
              {evaluationResults.map((result) =>
                result.models.map((model) => (
                  <React.Fragment key={model.modelName}>
                    {model.details.map((detail, index) => (
                      <tr key={index}>
                        {index === 0 && <td rowSpan={model.details.length}>{result.inputText}</td>}
                        <td>{model.modelName}</td>
                        <td>{model.average}</td>
                        <td>{detail.translation}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompareTranslate;




