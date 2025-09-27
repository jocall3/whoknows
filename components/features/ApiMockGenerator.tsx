import React, { useState, useEffect } from 'react';
import { generateMockData, parseOpenApiForMocking } from '../../services/index.ts';
import { startMockServer, stopMockServer, setMockRoutes, isMockServerRunning } from '../../services/mocking/mockServer.ts';
import { saveMockCollection, getAllMockCollections, deleteMockCollection } from '../../services/mocking/db.ts';
import { ServerStackIcon, SparklesIcon } from '../icons/index.ts';
import { LoadingSpinner } from '../shared/index.tsx';
import { useNotification } from '../../contexts/NotificationContext.tsx';

const citibankOpenApiSpec = `
openapi: 3.0.1
info:
  title: Citibank Demo Business Inc
  version: v1
  contact:
    name: Citibank Demo Business Inc Engineering Team
    url: https://citibankdemobusiness.dev
  description: The Citibank Demo Business Inc REST API. Please see https://docs.citibankdemobusiness.dev
    for more details.
paths:
  "/api/{accounts_type}/{account_id}/account_details":
    get:
      summary: list account_details
      tags:
      - AccountDetail
      description: Get a list of account details for a single internal or external
        account.
      operationId: listAccountDetails
      security:
      - basic_auth: []
      parameters:
      - name: accounts_type
        in: path
        schema:
          type: string
          enum:
          - external_accounts
          - internal_accounts
        required: true
      - name: account_id
        in: path
        description: The ID of the account.
        required: true
        schema:
          type: string
      responses:
        '200':
          description: successful
          content:
            application/json:
              schema:
                type: array
                items:
                  "$ref": "#/components/schemas/account_detail"
components:
  schemas:
    account_detail:
      type: object
      properties:
        id:
          type: string
          format: uuid
        object:
          type: string
        account_number:
          type: string
        account_number_type:
          type: string
          enum:
          - clabe
          - iban
          - other
    Transaction:
      type: object
      properties:
        id:
          type: string
          format: uuid
        amount:
          type: integer
        currency:
          type: string
`;

type GeneratorMode = 'simple' | 'openapi';

export const ApiMockGenerator: React.FC = () => {
    const [mode, setMode] = useState<GeneratorMode>('openapi');
    const [schema, setSchema] = useState("a user with an id, name, email, and a nested address object containing a city and country");
    const [count, setCount] = useState(5);
    const [collectionName, setCollectionName] = useState('users');
    const [openApiSpec, setOpenApiSpec] = useState(citibankOpenApiSpec.trim());
    const [collections, setCollections] = useState<any[]>([]);
    const [generatedData, setGeneratedData] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isServerRunning, setIsServerRunning] = useState(isMockServerRunning());
    const [routes, setRoutes] = useState<any[]>([]);
    const { addNotification } = useNotification();

    useEffect(() => {
        const loadCollections = async () => {
            const storedCollections = await getAllMockCollections();
            setCollections(storedCollections);
        };
        loadCollections();
    }, []);

    const updateRoutesOnServer = (routesToSet: any[], collectionsToUse: any[]) => {
        const mockRoutes = routesToSet.map(route => {
            const pathParts = route.path.split('/');
            const collectionIdFromPath = pathParts[pathParts.length - 1].replace(/[^a-zA-Z0-9]/g, '');
            const matchingCollection = collectionsToUse.find(c => c.id.toLowerCase().includes(collectionIdFromPath));
            
            return {
                ...route,
                response: {
                    status: 200,
                    body: matchingCollection ? matchingCollection.data : { message: `No mock data found for this route.` }
                }
            };
        });
        setMockRoutes(mockRoutes as any);
    };

    useEffect(() => {
        if (isServerRunning) {
            updateRoutesOnServer(routes, collections);
        }
    }, [routes, collections, isServerRunning]);

    const handleGenerateSimple = async () => {
        if (!schema.trim() || !collectionName.trim()) {
            setError('Schema description and collection name are required.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            const data = await generateMockData(schema, count);
            setGeneratedData(data);
            const collectionId = collectionName.toLowerCase().replace(/\s/g, '-');
            await saveMockCollection({ id: collectionId, schemaDescription: schema, data });
            setCollections(await getAllMockCollections());
            addNotification(`Collection "${collectionId}" saved!`, 'success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate data.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGenerateFromSpec = async () => {
        if (!openApiSpec.trim()) {
            setError('OpenAPI specification is required.');
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedData(null);

        try {
            const parsedSpec = await parseOpenApiForMocking(openApiSpec);
            
            const collectionsToSave: any[] = [];
            for (const schema of parsedSpec.schemas) {
                const data = await generateMockData(schema.description, 5);
                const collection = { id: schema.name, schemaDescription: schema.description, data };
                collectionsToSave.push(collection);
            }
            
            await Promise.all(collectionsToSave.map(c => saveMockCollection(c)));

            const newRoutes = parsedSpec.routes.map(route => ({
                path: route.path.replace(/{[^}]+}/g, '*'),
                method: route.method.toUpperCase(),
            }));

            setRoutes(newRoutes);
            
            const allCollections = await getAllMockCollections();
            setCollections(allCollections);
            setGeneratedData(collectionsToSave[0]?.data || []);
            addNotification('Mock API generated and routes configured. Start the server to use them.', 'info');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process OpenAPI spec.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleServerToggle = async () => {
        if (isServerRunning) {
            await stopMockServer();
            setIsServerRunning(false);
        } else {
            try {
                await startMockServer();
                setIsServerRunning(true);
                updateRoutesOnServer(routes, collections);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Could not start server.');
            }
        }
    };
    
    const SimpleGenerator = () => (
        <>
            <div><label className="text-sm">Describe the data schema</label><textarea value={schema} onChange={e => setSchema(e.target.value)} className="w-full mt-1 p-2 bg-background border border-border rounded" rows={4}/></div>
            <div className="flex gap-2">
                <div className="flex-grow"><label className="text-sm">Collection Name</label><input type="text" value={collectionName} onChange={e => setCollectionName(e.target.value)} className="w-full mt-1 p-2 bg-background border border-border rounded"/></div>
                <div><label className="text-sm">Count</label><input type="number" value={count} onChange={e => setCount(Number(e.target.value))} className="w-20 mt-1 p-2 bg-background border border-border rounded"/></div>
            </div>
            <button onClick={handleGenerateSimple} disabled={isLoading} className="btn-primary py-2 flex items-center justify-center gap-2">{isLoading ? <LoadingSpinner/> : <><SparklesIcon/> Generate & Save</>}</button>
        </>
    );
    
    const OpenApiGenerator = () => (
        <>
            <div>
                <label className="text-sm">OpenAPI 3 Specification (YAML)</label>
                <textarea value={openApiSpec} onChange={e => setOpenApiSpec(e.target.value)} className="w-full mt-1 p-2 bg-background border border-border rounded font-mono text-xs" rows={12}/>
            </div>
            <button onClick={handleGenerateFromSpec} disabled={isLoading} className="btn-primary py-2 flex items-center justify-center gap-2">{isLoading ? <LoadingSpinner/> : <><SparklesIcon/> Generate Mocks & Routes</>}</button>
        </>
    );

    return (
        <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 text-text-primary">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold flex items-center"><ServerStackIcon /><span className="ml-3">AI API Mock Server</span></h1>
                    <p className="text-text-secondary mt-1">Generate and serve mock API data locally using a service worker.</p>
                </div>
                <button onClick={handleServerToggle} className={`px-4 py-2 rounded-md font-semibold flex items-center gap-2 ${isServerRunning ? 'bg-green-100 text-green-700' : 'bg-gray-100 dark:bg-slate-700'}`}>
                    <span className={`w-3 h-3 rounded-full ${isServerRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isServerRunning ? 'Server Running' : 'Server Stopped'}
                </button>
            </header>
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                <div className="lg:col-span-1 flex flex-col gap-4 bg-surface p-4 border border-border rounded-lg">
                    <div className="flex border-b border-border">
                        <button onClick={() => setMode('simple')} className={`px-4 py-2 text-sm ${mode === 'simple' ? 'border-b-2 border-primary' : ''}`}>Simple Schema</button>
                        <button onClick={() => setMode('openapi')} className={`px-4 py-2 text-sm ${mode === 'openapi' ? 'border-b-2 border-primary' : ''}`}>OpenAPI Spec</button>
                    </div>
                    {mode === 'simple' ? <SimpleGenerator /> : <OpenApiGenerator />}
                    {error && <p className="text-red-500 text-xs text-center p-2 bg-red-500/10 rounded">{error}</p>}
                </div>

                <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
                   <div className="bg-surface p-4 border border-border rounded-lg flex-grow flex flex-col min-h-0">
                        <h3 className="text-lg font-bold mb-2">Server Status & Data</h3>
                        <div className="flex-grow grid grid-cols-2 gap-4 min-h-0">
                            <div className="overflow-y-auto pr-2">
                                <h4 className="font-semibold text-sm mb-1 sticky top-0 bg-surface pb-1">Saved Collections ({collections.length})</h4>
                                {collections.map(c => <div key={c.id} className="text-xs p-2 bg-background rounded border border-border mb-1">{c.id} ({c.data.length} items)</div>)}
                            </div>
                            <div className="overflow-y-auto pr-2">
                                <h4 className="font-semibold text-sm mb-1 sticky top-0 bg-surface pb-1">Configured Routes ({routes.length})</h4>
                                {routes.map((r, i) => <div key={i} className="flex gap-2 items-center mb-1"><span className="text-xs font-bold text-primary">{r.method}</span><span className="text-xs font-mono">{r.path}</span></div>)}
                            </div>
                        </div>
                   </div>
                </div>
            </div>
        </div>
    );
};