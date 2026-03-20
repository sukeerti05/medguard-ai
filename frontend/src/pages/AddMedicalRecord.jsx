import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function AddMedicalRecord() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "Lab Reports",
    test_name: "",
    hospital_name: "",
    lab_centre: "",
    lab_location: "",
    lab_id: "",
    test_date: "",
    result_summary: "",
    doctor_reference: "Self",
    reference_name: "",
    notes: "",
  });

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileType, setFileType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "doctor_reference" ? { reference_name: "" } : {}),
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0] || null;
    setFile(selectedFile);

    if (selectedFile) {
      setFileType(selectedFile.type);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setFileType("");
      setPreviewUrl("");
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      if (file) {
        data.append("file", file);
      }

      await API.post("/medical-records/add", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Medical record uploaded successfully");
      navigate("/medical-records");
    } catch (error) {
  console.error("Upload error full:", error);
  console.error("Upload error response:", error?.response?.data);
  console.error("Upload error status:", error?.response?.status);

  alert(
    error?.response?.data?.message ||
    error?.message ||
    "Upload failed"
  );
}
  };

  return (
    <div className="add-record-page">
      <div className="add-record-container">
        <h2>Add Medical Record</h2>

        <form onSubmit={handleSubmit} className="add-record-form">
          <table>
            <tbody>
              <tr>
                <td colSpan="2" className="section-title">
                  Test Information
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="category">Category</label>
                </td>
                <td>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="Lab Reports">Lab Reports</option>
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Blood Tests">Blood Tests</option>
                    <option value="Vaccination Records">Vaccination Records</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="test_name">Test Name</label>
                </td>
                <td>
                  <input
                    id="test_name"
                    type="text"
                    name="test_name"
                    value={form.test_name}
                    onChange={handleChange}
                    placeholder="Enter test name"
                    required
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="test_date">Test Date</label>
                </td>
                <td>
                  <input
                    id="test_date"
                    type="date"
                    name="test_date"
                    value={form.test_date}
                    onChange={handleChange}
                    required
                  />
                </td>
              </tr>

              <tr>
                <td colSpan="2" className="section-title">
                  Lab Details
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="hospital_name">Hospital Name</label>
                </td>
                <td>
                  <input
                    id="hospital_name"
                    type="text"
                    name="hospital_name"
                    value={form.hospital_name}
                    onChange={handleChange}
                    placeholder="Enter hospital name"
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="lab_centre">Lab Centre Name</label>
                </td>
                <td>
                  <input
                    id="lab_centre"
                    type="text"
                    name="lab_centre"
                    value={form.lab_centre}
                    onChange={handleChange}
                    placeholder="Enter lab centre name"
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="lab_location">Lab Location</label>
                </td>
                <td>
                  <input
                    id="lab_location"
                    type="text"
                    name="lab_location"
                    value={form.lab_location}
                    onChange={handleChange}
                    placeholder="Enter lab location"
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="lab_id">Lab Report ID</label>
                </td>
                <td>
                  <input
                    id="lab_id"
                    type="text"
                    name="lab_id"
                    value={form.lab_id}
                    onChange={handleChange}
                    placeholder="Enter lab report ID"
                  />
                </td>
              </tr>

              <tr>
                <td colSpan="2" className="section-title">
                  Medical Details
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="result_summary">Result Summary</label>
                </td>
                <td>
                  <textarea
                    id="result_summary"
                    name="result_summary"
                    value={form.result_summary}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter result summary"
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="doctor_reference">Reference</label>
                </td>
                <td>
                  <select
                    id="doctor_reference"
                    name="doctor_reference"
                    value={form.doctor_reference}
                    onChange={handleChange}
                  >
                    <option value="Self">Self</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </td>
              </tr>

              {form.doctor_reference !== "Self" && (
                <tr>
                  <td>
                    <label htmlFor="reference_name">
                      {form.doctor_reference === "Doctor" && "Doctor Name"}
                      {form.doctor_reference === "Relative" && "Relative Name"}
                      {form.doctor_reference === "Friend" && "Friend Name"}
                      {form.doctor_reference === "Other" && "Specify"}
                    </label>
                  </td>
                  <td>
                    <input
                      id="reference_name"
                      type="text"
                      name="reference_name"
                      value={form.reference_name}
                      onChange={handleChange}
                      placeholder={
                        form.doctor_reference === "Doctor"
                          ? "Enter doctor name"
                          : form.doctor_reference === "Relative"
                          ? "Enter relative name"
                          : form.doctor_reference === "Friend"
                          ? "Enter friend name"
                          : "Specify reference"
                      }
                      required
                    />
                  </td>
                </tr>
              )}

              <tr>
                <td>
                  <label htmlFor="notes">Notes</label>
                </td>
                <td>
                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter notes"
                  />
                </td>
              </tr>

              <tr>
                <td>
                  <label htmlFor="file">Upload File</label>
                </td>
                <td>
                  <input
                    id="file"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    required
                  />

                  {file && (
                    <div className="file-preview-box">
                      <p className="preview-title">Preview</p>

                      {fileType.startsWith("image/") ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="preview-img"
                        />
                      ) : fileType === "application/pdf" ? (
                        <iframe
                          src={previewUrl}
                          title="PDF Preview"
                          className="preview-pdf"
                        />
                      ) : (
                        <p className="preview-file-name">{file.name}</p>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="button-group">
            <button
              type="button"
              onClick={() => navigate("/medical-records")}
            >
              Cancel
            </button>
            <button type="submit">Upload Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}