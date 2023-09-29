const translations = {
  en: {
    dashboard: "Dashboard",
    totalComplaint: "Total Complaints",
    complaintsQueue: "Complaints in Queue",
    complaintsProgress: "Complaints in Progress",
    completed: "Completed",
    registerComplaint: "Register Complaint",
    complaintTitle: "Complaint Title",
    description: "Description",
    complaintCategory: "Complaint Category",
    uploadImages: "Upload Images",
    submit: "Submit",
    latestComplaints: "Latest Complaints",
    no: "No",
    status: "Status",
    date: "Date",
    complaints: "Complaints",
    logout: "Logout",
    public: "Public",
    private: "Private",
    viewAll: "View All",
    allComplaints: "All Complaints",
    all: "All",
    success: "Success",
    progress: "Progress",
    queue: "Queue",
    profile: "Profile",
    name: "Name",
    email: "E-mail",
    phoneNumber: "Phone Number",
    address: "Address",
    userComplaints: "User's Complaints",
    actionPanel: "Action Panel",
    comments: "Comments",
    title: "Title",
    statusMessage: "Status Message",
    areaOfComplaint: "Area Of Complaint",
    complaintAreas: "Complaint Areas",
    addComplaintArea: "Add Complaint Area",
  },
  ne: {
    dashboard: "ड्यासबोर्ड",
    totalComplaint: "कुल गुनासो",
    complaintsQueue: "कतारमा रहेका गुनासोहरू",
    complaintsProgress: "प्रगतिमा रहेका गुनासोहरू",
    completed: "सम्पन्न",
    registerComplaint: "गुनासो दर्ता गर्नुहोस्",
    complaintTitle: "गुनासोको शीर्षक",
    description: "विवरण",
    complaintCategory: "गुनासो श्रेणी",
    uploadImages: "तस्वीरहरू अपलोड गर्नुहोस्",
    submit: "पेश गर्नुहोस्",
    latestComplaints: "नवीनतम गुनासोहरू",
    no: "अङ्क",
    status: "स्थिति",
    date: "मिति",
    complaints: "गुनासोहरू",
    logout: "लगआउट",
    public: "सार्वजनिक",
    private: "निजी",
    viewAll: "सबै हेर्नुहोस्",
    allComplaints: "सबै गुनासोहरू",
    all: "सबै",
    success: "सफलता",
    progress: "प्रगति",
    queue: "कतार",
    profile: "प्रोफाइल",
    name: "नाम",
    email: "ईमेल",
    phoneNumber: "फोन नम्बर",
    address: "ठेगाना",
    userComplaints: "प्रयोगकर्ताको गुनासोहरू",
    actionPanel: "कार्य पैनल",
    comments: "टिप्पणीहरू",
    title: "शीर्षक",
    statusMessage: "स्थिति सन्देश",
    areaOfComplaint: "गुनासोको क्षेत्र",
    complaintAreas: "गुनासो क्षेत्रहरू",
    addComplaintArea: "गुनासो क्षेत्र थप्नुहोस्",
    complaintType:"गुनासोको प्रकार"
  },
};


function translatePageContent(e) {
  // Get all elements with data-i18n attribute
  const language = e.value;
  console.log(language);
  const elements = document.querySelectorAll("[data-i18n]");

  // Loop through each element and update its content based on the translation
  elements.forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });
}
