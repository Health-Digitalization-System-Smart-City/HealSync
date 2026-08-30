"use client";

import * as React from "react";

export const FEEDBACK_LOCALES = ["en", "am", "om"] as const;
export type FeedbackLocale = (typeof FEEDBACK_LOCALES)[number];

export const localeNames: Record<FeedbackLocale, string> = {
  en: "English",
  am: "አማርኛ",
  om: "Afaan Oromoo",
};

const messages = {
  en: {
    language: "Language",
    patientExperience: "Patient experience",
    feedback: "Smart Feedback",
    aboutMinute: "About 1 minute",
    intro:
      "Share your visit experience so we can improve care, access, and communication across our clinics.",
    fastClear: "Fast and clear",
    fastClearText: "Complete a brief, guided survey in a few taps.",
    private: "Private by design",
    privateText: "Only the details needed to improve care are collected.",
    perspective: "Your perspective matters",
    perspectiveText: "Feedback helps us improve the patient journey.",
    quickSurvey: "Quick 4-step survey",
    noAccount: "No account required",
    secure: "Private and secure",
    experienceMatters: "Your care experience matters",
    experienceIntro:
      "We value your health and experience. Please share your feedback to help us serve you better.",
    phoneTitle: "Phone Number",
    phoneDescription:
      "Enter your Ethiopian phone number to proceed with your feedback.",
    phoneLabel: "Patient Phone Number",
    phoneHint:
      "Your phone number is kept confidential and only used for verified patient feedback records.",
    phonePlaceholder: "912 345 678",
    phoneCountryCode: "+251",
    phoneCountryName: "Ethiopia",
    phoneInvalidFormat: "Enter digits after +251, e.g. 912 345 678.",
    continueBranch: "Continue to Branch Selection",
    branchTitle: "Select Branch",
    branchDescription: "Choose the clinic branch location you visited.",
    loadingBranches: "Loading clinic branches…",
    branchLoadError: "Couldn't load branches",
    branchLoadErrorText:
      "There was a problem loading the branch list. Please try again.",
    noBranches: "No branches available",
    noBranchesText:
      "There are no clinic branches accepting feedback right now. Please try again later.",
    refresh: "Refresh",
    searchBranches: "Search branch name or code…",
    noMatchingBranches: "No matching branches",
    serviceTitle: "Select Service",
    serviceDescription: "Select the service or department you visited at",
    loadingServices: "Loading available services…",
    loadingServicesHint: "Fetching the services offered at this branch.",
    serviceLoadError: "Couldn't load services",
    serviceLoadErrorText:
      "There was a problem loading services for this branch. Please try again.",
    noServices: "No services available at this branch",
    noServicesText:
      "This branch doesn't offer any services right now. Please choose a different branch or try again later.",
    differentBranch: "Choose a different branch",
    rateTitle: "Rate Your Experience",
    rateDescriptionStart: "Providing feedback for",
    rateDescriptionAt: "at",
    overallRating: "Overall Rating",
    writtenFeedback: "Written Feedback",
    commentPlaceholder: "Tell us what went well or what we could do better…",
    commentLimit: "Comment limit of {count} characters reached.",
    backServices: "Back to Services",
    submit: "Submit Feedback",
    submitting: "Submitting…",
    submitted: "Feedback Submitted",
    thankYou: "Thank You for Your Feedback!",
    thankYouText:
      "Your response helps us continuously improve the quality of care across our clinic branches.",
    reference: "Reference ID",
    branch: "Branch",
    service: "Service",
    notAvailable: "N/A",
    another: "Submit Another Response",
    home: "Return to Home",
    step: "Step {current} of 4 · {label}",
    phone: "Phone",
    rating: "Rating",
    back: "Back",
    verySatisfied: "Very Satisfied",
    verySatisfiedText: "Exceptional service and care",
    satisfied: "Satisfied",
    satisfiedText: "Met all expectations",
    mostlySatisfied: "Mostly Satisfied",
    mostlySatisfiedText: "Good overall, minor issues",
    good: "Good",
    goodText: "Decent experience",
    neutral: "Neutral",
    neutralText: "Neither good nor bad",
    notSatisfied: "Not Satisfied",
    notSatisfiedText: "Fell short of expectations",
    poor: "Poor",
    poorText: "Unsatisfactory experience",
    veryPoor: "Very Poor",
    veryPoorText: "Severe issues encountered",
  },

  am: {
    language: "ቋንቋ",
    patientExperience: "የታካሚ ተሞክሮ",
    feedback: "የSmart Feedback አስተያየት",
    aboutMinute: "1 ደቂቃ ያህል",
    intro: "በክሊኒኮቻችን ውስጥ ክብካቤን፣ ተደራሽነትን እና ግንኙነትን እንድናሻሽል የጉብኝት ተሞክሮዎን ያጋሩ።",
    fastClear: "ፈጣን እና ግልጽ",
    fastClearText: "አጭር መመሪያ ያለውን ጥናት በጥቂት መንካቶች ያጠናቅቁ።",
    private: "ግላዊነትን ያማከለ",
    privateText: "ክብካቤን ለማሻሻል የሚያስፈልጉ ዝርዝሮች ብቻ ይሰበሰባሉ።",
    perspective: "አመለካከትዎ አስፈላጊ ነው",
    perspectiveText: "አስተያየትዎ የታካሚውን ጉዞ እንድናሻሽል ይረዳናል።",
    quickSurvey: "ፈጣን 4-ደረጃ ጥናት",
    noAccount: "መለያ አያስፈልግም",
    secure: "ግላዊ እና ደህንነቱ የተጠበቀ",
    experienceMatters: "የክብካቤ ተሞክሮዎ አስፈላጊ ነው",
    experienceIntro: "ጤናዎን እና ተሞክሮዎን እናከብራለን። በተሻለ ለማገልገል አስተያየትዎን ያጋሩ።",
    phoneTitle: "ስልክ ቁጥር",
    phoneDescription: "ወደ አስተያየትዎ ለመቀጠል የኢትዮጵያ ስልክ ቁጥርዎን ያስገቡ።",
    phoneLabel: "የታካሚ ስልክ ቁጥር",
    phoneHint: "ስልክ ቁጥርዎ ሚስጥራዊ ሆኖ ይጠበቃል፤ ለተረጋገጡ የታካሚ መዝገቦች ብቻ ይጠቀማል።",
    phonePlaceholder: "912 345 678",
    phoneCountryCode: "+251",
    phoneCountryName: "ኢትዮጵያ",
    phoneInvalidFormat: "ከ+251 በኋላ ያሉ ቁጥሮችን ያስገቡ፣ ምሳሌ፦ 912 345 678።",
    continueBranch: "ወደ ቅርንጫፍ ምርጫ ቀጥል",
    branchTitle: "ቅርንጫፍ ይምረጡ",
    branchDescription: "የጎበኙትን የክሊኒክ ቅርንጫፍ ይምረጡ።",
    loadingBranches: "የክሊኒክ ቅርንጫፎች በመጫን ላይ…",
    branchLoadError: "ቅርንጫፎችን መጫን አልተቻለም",
    branchLoadErrorText: "የቅርንጫፎችን ዝርዝር ለመጫን ችግር ተፈጥሯል። እባክዎ ደግመው ይሞክሩ።",
    noBranches: "ምንም ቅርንጫፍ የለም",
    noBranchesText: "በአሁኑ ጊዜ አስተያየት የሚቀበል የክሊኒክ ቅርንጫፍ የለም።",
    refresh: "አድስ",
    searchBranches: "የቅርንጫፍ ስም ወይም ኮድ ይፈልጉ…",
    noMatchingBranches: "ተዛማጅ ቅርንጫፍ የለም",
    serviceTitle: "አገልግሎት ይምረጡ",
    serviceDescription: "በዚህ ቅርንጫፍ የጎበኙትን አገልግሎት ወይም ክፍል ይምረጡ",
    loadingServices: "ያሉ አገልግሎቶች በመጫን ላይ…",
    loadingServicesHint: "በዚህ ቅርንጫፍ የሚሰጡ አገልግሎቶችን በማምጣት ላይ።",
    serviceLoadError: "አገልግሎቶችን መጫን አልተቻለም",
    serviceLoadErrorText: "ለዚህ ቅርንጫፍ አገልግሎቶችን በመጫን ላይ ችግር ተፈጥሯል።",
    noServices: "በዚህ ቅርንጫፍ አገልግሎቶች የሉም",
    noServicesText: "ይህ ቅርንጫፍ በአሁኑ ጊዜ አገልግሎት አይሰጥም።",
    differentBranch: "የተለየ ቅርንጫፍ ይምረጡ",
    rateTitle: "ተሞክሮዎን ይገምግሙ",
    rateDescriptionStart: "አስተያየት በመስጠት ላይ ስለ",
    rateDescriptionAt: "በ",
    overallRating: "አጠቃላይ ደረጃ",
    writtenFeedback: "የተጻፈ አስተያየት",
    commentPlaceholder: "ጥሩ የነበረውን ወይም ማሻሻል የምንችለውን ይንገሩን…",
    commentLimit: "የ{count} ፊደላት ገደብ ደርሷል።",
    backServices: "ወደ አገልግሎቶች ተመለስ",
    submit: "አስተያየት አስገባ",
    submitting: "በመላክ ላይ…",
    submitted: "አስተያየት ገብቷል",
    thankYou: "ለአስተያየትዎ እናመሰግናለን!",
    thankYouText: "ምላሽዎ በክሊኒክ ቅርንጫፎቻችን የክብካቤ ጥራትን በቀጣይነት እንድናሻሽል ይረዳናል።",
    reference: "የማጣቀሻ መለያ",
    branch: "ቅርንጫፍ",
    service: "አገልግሎት",
    notAvailable: "አይገኝም",
    another: "ሌላ ምላሽ ያስገቡ",
    home: "ወደ መነሻ ተመለስ",
    step: "ደረጃ {current} ከ4 · {label}",
    phone: "ስልክ",
    rating: "ደረጃ",
    back: "ተመለስ",
    verySatisfied: "በጣም ረክቻለሁ",
    verySatisfiedText: "ልዩ አገልግሎት እና ክብካቤ",
    satisfied: "ረክቻለሁ",
    satisfiedText: "ሁሉንም ጥበቃዎች አሟልቷል",
    mostlySatisfied: "በአብዛኛው ረክቻለሁ",
    mostlySatisfiedText: "በአጠቃላይ ጥሩ፣ ጥቂት ችግሮች",
    good: "ጥሩ",
    goodText: "ጥሩ ተሞክሮ",
    neutral: "መካከለኛ",
    neutralText: "ጥሩም መጥፎም አይደለም",
    notSatisfied: "አልረካሁም",
    notSatisfiedText: "ከጥበቃ በታች",
    poor: "ደካማ",
    poorText: "አጥጋቢ ያልሆነ ተሞክሮ",
    veryPoor: "በጣም ደካማ",
    veryPoorText: "ከባድ ችግሮች ተገኝተዋል",
  },

  om: {
    language: "Afaan",
    patientExperience: "Muuxannoo dhukkubsataa",
    feedback: "Yaada Smart Feedback",
    aboutMinute: "Daqiiqaa 1 keessaa",
    intro:
      "Kunuunsa, argama tajaajilaa fi qunnamtii kilinikiilee keenya keessatti fooyyessuuf muuxannoo daawwannaa keessanii nuuf qoodaa.",
    fastClear: "Saffisaa fi ifaa",
    fastClearText:
      "Qorannoo gabaabaa qajeelfama qabu tuqaalee muraasaan guutaa.",
    private: "Dhuunfaa eegame",
    privateText:
      "Odeeffannoo kunuunsa fooyyessuuf barbaachisu qofa walitti qabna.",
    perspective: "Ilaalchi keessan barbaachisaa dha",
    perspectiveText:
      "Yaadni keessan imala dhukkubsataa fooyyessuuf nu gargaara.",
    quickSurvey: "Qorannoo tarkaanfii 4 saffisaa",
    noAccount: "Akkaawuntiin hin barbaachisu",
    secure: "Dhuunfaa fi nageenya qabu",
    experienceMatters: "Muuxannoon kunuunsaa keessan barbaachisaa dha",
    experienceIntro:
      "Fayyaa fi muuxannoo keessan ni kabajna. Akka isin caalaatti tajaajilluuf yaada keessan nuuf qoodaa.",
    phoneTitle: "Lakkoofsa Bilbilaa",
    phoneDescription:
      "Yaada keessan itti fufuuf lakkoofsa bilbilaa keessan galchaa.",
    phoneLabel: "Lakkoofsa Bilbilaa Dhukkubsataa",
    phoneHint:
      "Lakkoofsi bilbilaa keessan iccitii ta’ee kan eegamu, galmee dhukkubsataa mirkanaa’e qofaaf fayyadama.",
    phonePlaceholder: "fkn. 0912345678 ykn +251912345678",
    continueBranch: "Gara Filannoo Damee Itti Fufi",
    branchTitle: "Damee Filadhaa",
    branchDescription: "Bakka kilinikaa daawwattan filadhaa.",
    loadingBranches: "Dameewwan kilinikaa fe’aa jira…",
    branchLoadError: "Dameewwan fe’uun hin danda’amne",
    branchLoadErrorText:
      "Tarree dameewwanii fe’uuf rakkoon uumameera. Mee irra deebi’ii yaalaa.",
    noBranches: "Dameen hin argamu",
    noBranchesText: "Yeroo ammaatti dameen kilinikaa yaada fudhatu hin jiru.",
    refresh: "Haaromsi",
    searchBranches: "Maqaa ykn koodii damee barbaadi…",
    noMatchingBranches: "Dameen walsimu hin jiru",
    serviceTitle: "Tajaajila Filadhaa",
    serviceDescription:
      "Damee kana keessatti tajaajila ykn kutaa daawwattan filadhaa",
    loadingServices: "Tajaajiloonni jiran fe’amaa jiru…",
    loadingServicesHint: "Tajaajiloota dameen kun kennu fidaa jirra.",
    serviceLoadError: "Tajaajiloota fe’uun hin danda’amne",
    serviceLoadErrorText: "Tajaajiloota damee kanaa fe’uuf rakkoon uumameera.",
    noServices: "Damee kana keessatti tajaajilli hin jiru",
    noServicesText: "Dameen kun yeroo ammaatti tajaajila hin kennu.",
    differentBranch: "Damee biraa filadhaa",
    rateTitle: "Muuxannoo Keessan Madaalaa",
    rateDescriptionStart: "Yaada kennuu irratti",
    rateDescriptionAt: "bakka",
    overallRating: "Madaallii Waliigalaa",
    writtenFeedback: "Yaada Barreeffamaa",
    commentPlaceholder:
      "Wanti gaarii maal akka ta’e ykn maal fooyyessuu akka dandeenyu nuuf jedhu…",
    commentLimit: "Daangaan qubee {count} gaheera.",
    backServices: "Gara Tajaajilootaatti Deebi’i",
    submit: "Yaada Galchi",
    submitting: "Ergaa jira…",
    submitted: "Yaadni Galmaa’eera",
    thankYou: "Yaada Keessaniif Galatoomaa!",
    thankYouText:
      "Deebiin keessan qulqullina kunuunsa dameewwan kilinikaa keenya keessatti itti fufiinsaan fooyyessuuf nu gargaara.",
    reference: "Eenyummaa Wabii",
    branch: "Damee",
    service: "Tajaajila",
    notAvailable: "Hin Argamu",
    another: "Deebii Biraa Galchi",
    home: "Gara Manaatti Deebi’i",
    step: "Tarkaanfii {current} keessaa 4 · {label}",
    phone: "Bilbila",
    rating: "Madaallii",
    back: "Deebi’i",
    verySatisfied: "Baay’ee Gammade",
    verySatisfiedText: "Tajaajila fi kunuunsa adda keessaa",
    satisfied: "Gammade",
    satisfiedText: "Eegumsa hunda guute",
    mostlySatisfied: "Irratti Caalaan Gammade",
    mostlySatisfiedText: "Waliigalaan gaarii, rakkoo xiqqaa",
    good: "Gaarii",
    goodText: "Muuxannoo gaarii",
    neutral: "Giddugaleessa",
    neutralText: "Gaarii fi badaa gidduu",
    notSatisfied: "Hin Gammadne",
    notSatisfiedText: "Eegumsa gadi",
    poor: "Hamaa",
    poorText: "Muuxannoo hin quubsine",
    veryPoor: "Baay’ee Hamaa",
    veryPoorText: "Rakkoolee ciccimoo mudatan",
  },
} as const;

const dashboardMessages = {
  en: {
    navDashboard: "Dashboard",
    navTasks: "Tasks",
    navFeedback: "Feedback",
    navAnalytics: "Analytics",
    navAi: "AI Insights",
    navBranches: "Branches",
    navServices: "Services",
    navUsers: "Users",
    navProfile: "Profile & Security",
    sectionCore: "Core",
    sectionOperations: "Operations",
    sectionIntelligence: "Intelligence",
    sectionManagement: "Management",
    sectionAccount: "Account",
    overview: "Overview",
    tasksWorkflows: "Tasks & Workflows",
    patientFeedback: "Patient Feedback",
    analyticsIntelligence: "Analytics & Intelligence",
    clinicBranches: "Clinic Branches",
    medicalServices: "Medical Services",
    staffRoles: "Staff & User Roles",
    dashboardNavigation: "Dashboard navigation",
    breadcrumbs: "Breadcrumbs",
    branchesActive: "{count} Branches Active",
    clinicsConnected: "{count} Clinics Connected",
    monitoringActive: "Real-time patient feedback & SLA monitoring active.",
    openNavigation: "Open navigation menu",
    closeNavigation: "Close navigation",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    dashboardHome: "Smart Feedback dashboard",
    openUserMenu: "Open user menu",
    accessManaged: "Your access is managed by your administrator",
    dashboardOverview: "Dashboard Overview",
    signOut: "Sign out",
    signingOut: "Signing out…",
    role: "{role} role",
    homeHow: "How it works",
    homeWhy: "Why it matters",
    staffLogin: "Staff login",
    giveFeedback: "Give feedback",
    patientFirst: "Patient-first feedback",
    homeTitle: "Tell us how your visit went.",
    homeIntro:
      "Scan the QR code at your clinic, answer a few simple questions, and submit feedback in about a minute. No account needed.",
    shareFeedback: "Share your feedback",
    seeHow: "See how it works",
    noAccountPrivate: "No account needed · Private and secure",
    ready: "Ready to share your experience?",
    readyText:
      "Your feedback helps us improve the next visit for you and for everyone else who comes after.",
    feedbackNow: "Give feedback now",
    homeFooter: "Feedback platform for private healthcare clinics.",
    rights: "All rights reserved.",
  },

  am: {
    navDashboard: "ዳሽቦርድ",
    navTasks: "ተግባራት",
    navFeedback: "አስተያየት",
    navAnalytics: "ትንተና",
    navAi: "የAI ግንዛቤዎች",
    navBranches: "ቅርንጫፎች",
    navServices: "አገልግሎቶች",
    navUsers: "ተጠቃሚዎች",
    navProfile: "መገለጫ እና ደህንነት",
    sectionCore: "ዋና",
    sectionOperations: "ክወናዎች",
    sectionIntelligence: "ግንዛቤ",
    sectionManagement: "አስተዳደር",
    sectionAccount: "መለያ",
    overview: "አጠቃላይ እይታ",
    tasksWorkflows: "ተግባራት እና ሂደቶች",
    patientFeedback: "የታካሚ አስተያየት",
    analyticsIntelligence: "ትንተና እና ግንዛቤ",
    clinicBranches: "የክሊኒክ ቅርንጫፎች",
    medicalServices: "የሕክምና አገልግሎቶች",
    staffRoles: "ሰራተኞች እና ሚናዎች",
    dashboardNavigation: "የዳሽቦርድ አሰሳ",
    breadcrumbs: "የገጽ ዱካ",
    branchesActive: "{count} ቅርንጫፎች ንቁ ናቸው",
    clinicsConnected: "{count} ክሊኒኮች ተገናኝተዋል",
    monitoringActive: "የታካሚ አስተያየት እና SLA ክትትል ንቁ ነው።",
    openNavigation: "የአሰሳ ምናሌ ክፈት",
    closeNavigation: "አሰሳን ዝጋ",
    expandSidebar: "የጎን አሞሌን ዘርጋ",
    collapseSidebar: "የጎን አሞሌን ሰብስብ",
    dashboardHome: "የSmart Feedback ዳሽቦርድ",
    openUserMenu: "የተጠቃሚ ምናሌ ክፈት",
    accessManaged: "መዳረሻዎ በአስተዳዳሪዎ ይተዳደራል",
    dashboardOverview: "የዳሽቦርድ አጠቃላይ እይታ",
    signOut: "ውጣ",
    signingOut: "በመውጣት ላይ…",
    role: "{role} ሚና",
    homeHow: "እንዴት እንደሚሰራ",
    homeWhy: "ለምን አስፈላጊ ነው",
    staffLogin: "የሰራተኛ መግቢያ",
    giveFeedback: "አስተያየት ይስጡ",
    patientFirst: "ታካሚን ቀዳሚ ያደረገ አስተያየት",
    homeTitle: "ጉብኝትዎ እንዴት እንደነበር ይንገሩን።",
    homeIntro:
      "በክሊኒክዎ ያለውን QR ኮድ ይቃኙ፣ ጥቂት ቀላል ጥያቄዎችን ይመልሱ እና በአንድ ደቂቃ ያህል ውስጥ አስተያየትዎን ያስገቡ። መለያ አያስፈልግም።",
    shareFeedback: "አስተያየትዎን ያጋሩ",
    seeHow: "እንዴት እንደሚሰራ ይመልከቱ",
    noAccountPrivate: "መለያ አያስፈልግም · ግላዊ እና ደህንነቱ የተጠበቀ",
    ready: "ተሞክሮዎን ለማጋራት ዝግጁ ነዎት?",
    readyText: "አስተያየትዎ ለእርስዎ እና ከእርስዎ በኋላ ለሚመጡ ሰዎች ቀጣዩን ጉብኝት እንድናሻሽል ይረዳናል።",
    feedbackNow: "አሁን አስተያየት ይስጡ",
    homeFooter: "ለግል የጤና ክሊኒኮች የአስተያየት መድረክ።",
    rights: "መብቶች በሙሉ የተጠበቁ ናቸው።",
  },

  om: {
    navDashboard: "Daashboordii",
    navTasks: "Hojiiwwan",
    navFeedback: "Yaada",
    navAnalytics: "Xiinxala",
    navAi: "Hubannoo AI",
    navBranches: "Dameewwan",
    navServices: "Tajaajiloota",
    navUsers: "Fayyadamtoota",
    navProfile: "Piroofaayilii fi Nageenya",
    sectionCore: "Bu’uuraa",
    sectionOperations: "Hojiiwwan",
    sectionIntelligence: "Hubannoo",
    sectionManagement: "Bulchiinsa",
    sectionAccount: "Akkaawuntii",
    overview: "Ilaalcha Waliigalaa",
    tasksWorkflows: "Hojiiwwanii fi Adeemsa",
    patientFeedback: "Yaada Dhukkubsataa",
    analyticsIntelligence: "Xiinxalaa fi Hubannoo",
    clinicBranches: "Dameewwan Kilinikaa",
    medicalServices: "Tajaajiloota Fayyaa",
    staffRoles: "Hojjettootaa fi Gahee",
    dashboardNavigation: "Daandii Daashboordii",
    breadcrumbs: "Mallattoo Daandii",
    branchesActive: "Dameewwan {count} Socho’an",
    clinicsConnected: "Kilinikiileen {count} Walqabatan",
    monitoringActive:
      "Yaadni dhukkubsataa yeroo qabatamaa fi hordoffiin SLA ni hojjeta.",
    openNavigation: "Menyu daandii bani",
    closeNavigation: "Daandii cufi",
    expandSidebar: "Cinaacha bal’isi",
    collapseSidebar: "Cinaacha gabaabsi",
    dashboardHome: "Daashboordii Smart Feedback",
    openUserMenu: "Menyu fayyadamaa bani",
    accessManaged: "Argamni keessan bulchaa keessaniin to’atama",
    dashboardOverview: "Ilaalcha Waliigalaa Daashboordii",
    signOut: "Ba’i",
    signingOut: "Ba’aa jira…",
    role: "gahee {role}",
    homeHow: "Akkaataa itti hojjatu",
    homeWhy: "Maaliif barbaachisaa dha",
    staffLogin: "Seensa hojjetaa",
    giveFeedback: "Yaada kenni",
    patientFirst: "Yaada dhukkubsataa dursu",
    homeTitle: "Daawwannaan keessan akkam akka ture nuuf jedhu.",
    homeIntro:
      "Koodii QR kilinika keessanii irratti argamu iskanii godhaa, gaaffiiwwan salphaa muraasa deebisaa, daqiiqaa tokko keessatti yaada galchaa. Akkaawuntiin hin barbaachisu.",
    shareFeedback: "Yaada keessan qoodaa",
    seeHow: "Akkaataa itti hojjatu ilaalaa",
    noAccountPrivate:
      "Akkaawuntiin hin barbaachisu · Dhuunfaa fi nageenya qabu",
    ready: "Muuxannoo keessan qooduuf qophooftanii?",
    readyText:
      "Yaadni keessan daawwannaa itti aanu isinii fi namoota isin booda dhufaniif fooyyessuuf nu gargaara.",
    feedbackNow: "Amma yaada kenni",
    homeFooter: "Waltajjii yaada kilinikiilee fayyaa dhuunfaa.",
    rights: "Mirgi hundi kan eegame dha.",
  },
} as const;

type MessageKey =
  keyof (typeof messages)["en"] | keyof (typeof dashboardMessages)["en"];

type Values = Record<string, string | number>;

function interpolate(value: string, values?: Values) {
  return value.replace(/\{(\w+)\}/g, (_, key: string) =>
    values?.[key] === undefined ? `{${key}}` : String(values[key]),
  );
}

type FeedbackI18nValue = {
  locale: FeedbackLocale;
  setLocale: (locale: FeedbackLocale) => void;
  t: (key: MessageKey, values?: Values) => string;
};

const FeedbackI18nContext = React.createContext<FeedbackI18nValue | null>(null);

function getSavedLocale(): FeedbackLocale {
  const value = document.cookie.match(/(?:^|; )healsync_locale=([^;]+)/)?.[1];

  return FEEDBACK_LOCALES.includes(value as FeedbackLocale)
    ? (value as FeedbackLocale)
    : "en";
}

export function FeedbackLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start with the server-rendered fallback so a remembered language cannot
  // cause a hydration mismatch, then apply the browser preference.
  const [locale, setLocale] = React.useState<FeedbackLocale>("en");

  React.useEffect(() => {
    // Intentional: initialize browser-only persisted state after hydration.
    // This avoids reading document.cookie during SSR and prevents
    // a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocale(getSavedLocale());
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
    document.cookie = `healsync_locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  const value = React.useMemo<FeedbackI18nValue>(
    () => ({
      locale,
      setLocale,
      t: (key, values) =>
        interpolate(
          (messages[locale] as Record<string, string>)[key] ??
            (dashboardMessages[locale] as Record<string, string>)[key],
          values,
        ),
    }),
    [locale],
  );

  return (
    <FeedbackI18nContext.Provider value={value}>
      {children}
    </FeedbackI18nContext.Provider>
  );
}

export function useFeedbackI18n(): FeedbackI18nValue {
  const value = React.useContext(FeedbackI18nContext);

  if (value) return value;

  // Keeps isolated component tests and embeddable forms usable.
  // The app layout always supplies the real, persistent provider.
  return {
    locale: "en",
    setLocale: () => undefined,
    t: (key: MessageKey, values?: Values) =>
      interpolate(
        (messages.en as Record<string, string>)[key] ??
          (dashboardMessages.en as Record<string, string>)[key],
        values,
      ),
  };
}
