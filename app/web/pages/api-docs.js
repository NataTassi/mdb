import dynamic from "next/dynamic";
import 'swagger-ui-react/swagger-ui.css';
import specFile from 'pages/api/api.yaml';

const SwaggerUI = dynamic(import('swagger-ui-react'), {ssr: false});

const ApiDocs = () => (
    <SwaggerUI spec={specFile} 
        defaultModelsExpandDepth='2'
        defaultModelExpandDepth='2'
        displayRequestDuration='true' 
    />
)
export default ApiDocs;