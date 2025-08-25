import React from 'react';
import type { CustomFeature } from '../../types.ts';

const iframeContent = (code: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <script type="importmap">
    {
      "imports": {
        "react": "https://esm.sh/react@18.3.1",
        "react-dom/client": "https://esm.sh/react-dom@18.3.1/client"
      }
    }
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root" class="p-4"></div>
  <script type="text/babel">
    import React from 'react';
    import ReactDOM from 'react-dom/client';

    try {
      const App = (function() {
        const module = { exports: {} };
        (function(module, exports, React) {
          // --- Start of AI Generated Code ---
          ${code}
          // --- End of AI Generated Code ---
        })(module, module.exports, React);
        return module.exports.default;
      })();
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
    } catch (e) {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(
        <div style={{color: 'red', fontFamily: 'monospace'}}>
          <h3>Error Rendering Component</h3>
          <pre>{e.stack}</pre>
        </div>
      );
      console.error(e);
    }
  </script>
</body>
</html>
`;


export const CustomFeatureRunner: React.FC<{ feature: CustomFeature }> = ({ feature }) => {
    return (
        <div className="h-full w-full bg-background">
            <iframe
                srcDoc={iframeContent(feature.code)}
                title={`Preview: ${feature.name}`}
                sandbox="allow-scripts"
                className="w-full h-full border-0"
            />
        </div>
    );
};
