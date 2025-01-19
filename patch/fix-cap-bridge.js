import fs from 'fs';

// Capacitor 6+ blocks running an app on a different hostname and there is not a capacitor config setting to fix this
// So, we patch the Bridge.java file to allow all origins

function replaceLineInFile(filePath, oldLine, newLine) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const lines = data.split('\n');
        const index = lines.findIndex(line => line.trim() === oldLine);

        if (index !== -1) {
          lines[index] = newLine;
          const updatedData = lines.join('\n');

          fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
              reject(err);
            } else {
              console.log(`Successfully replaced line in ${filePath}`);
              resolve();
            }
          });
        } else {
          const index = lines.findIndex(line => line.trim() === newLine);
          if (index === -1) {
            // Wasnt already replaced
            reject(new Error(`Line "${oldLine}" not found in ${filePath}`));
          }
        }
      }
    });
  });
}

// Example usage:
const filePath = 'node_modules/@capacitor/android/capacitor/src/main/java/com/getcapacitor/Bridge.java';
const oldLine = 'String allowedOrigin = Uri.parse(appUrl).buildUpon().path(null).fragment(null).clearQuery().build().toString();';
const newLine = 'String allowedOrigin = "*"; //Uri.parse(appUrl).buildUpon().path(null).fragment(null).clearQuery().build().toString();';

replaceLineInFile(filePath, oldLine, newLine)
  .then(() => {
    console.log('Bridge.java updated successfully!');
  })
  .catch(error => {
    console.error('Error:', error);
  });