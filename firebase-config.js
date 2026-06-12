// ============================================================
//  הגדרות Firebase – המלצות לקוחות
// ============================================================
// כדי להפעיל שמירת המלצות בענן (חינמי), בצעו את השלבים הבאים:
//
// 1. היכנסו ל-https://console.firebase.google.com ולחצו "Add project".
// 2. אחרי יצירת הפרויקט, בתפריט השמאלי בחרו  Build > Firestore Database
//    ולחצו "Create database" (אפשר לבחור מצב "Production").
// 3. בלשונית Rules הדביקו את הכללים הבאים ולחצו Publish:
//
//      rules_version = '2';
//      service cloud.firestore {
//        match /databases/{database}/documents {
//          match /testimonials/{doc} {
//            allow read: if true;
//            allow create: if request.resource.data.name is string
//                          && request.resource.data.text is string
//                          && request.resource.data.rating is number
//                          && request.resource.data.rating >= 1
//                          && request.resource.data.rating <= 5;
//            allow update, delete: if false;
//          }
//        }
//      }
//
// 4. בעמוד הראשי של הפרויקט לחצו על אייקון ה-Web (</>) כדי לרשום אפליקציית web,
//    והעתיקו משם את ערכי ה-firebaseConfig אל המשתנה שלמטה.
// 5. שמרו את הקובץ — וזהו! ההמלצות יישמרו ויוצגו לכל המבקרים.
//
// אם המשתנה נשאר עם הערכים "REPLACE_ME", האתר ימשיך לעבוד אך
// המלצות חדשות יישמרו רק באופן מקומי בדפדפן של הכותב (לצורכי הדגמה).
// ============================================================

window.firebaseConfig = {
    apiKey: "REPLACE_ME",
    authDomain: "REPLACE_ME.firebaseapp.com",
    projectId: "REPLACE_ME",
    storageBucket: "REPLACE_ME.appspot.com",
    messagingSenderId: "REPLACE_ME",
    appId: "REPLACE_ME"
};
