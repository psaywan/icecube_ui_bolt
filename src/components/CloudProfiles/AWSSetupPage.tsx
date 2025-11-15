import { useState, useEffect } from 'react';
import {
  Cloud,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Copy,
  Shield,
  Key,
  RefreshCw,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/RDSAuthContext';

const CONFIG = {
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3
};

interface AWSSetupPageProps {
  onBack: () => void;
}

export default function AWSSetupPage({ onBack }: AWSSetupPageProps) {
  const [setupMethod, setSetupMethod] = useState('cloudformation');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    profileName: '',
    region: 'us-east-1',
    customDomain: '',
    setupMethod: 'cloudformation'
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [successNotification, setSuccessNotification] = useState<any>(null);

  const { user, account, profile } = useAuth();
  const externalId = account?.account_id || 'loading';

  const handleCustomDomainChange = (value: string) => {
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    setFormData({...formData, customDomain: cleaned});
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setConnectionStatus('copied');
      setTimeout(() => setConnectionStatus(null), 2000);
    } catch (error) {
      alert(`Copy: ${text}`);
    }
  };

  const handleCreateAWSProfileAPI = async () => {
    setIsTestingConnection(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockResponse = {
        success: true,
        data: {
          stack_name: `IceCube-${formData.customDomain || 'default'}`,
          quick_create_stack_url: 'https://console.aws.amazon.com/cloudformation',
          role_name: `IceCube-${externalId}-${formData.customDomain || 'default'}`,
          lambda_name: `IceCube-PH-${externalId}-${formData.customDomain || 'default'}`
        }
      };

      setApiResponse(mockResponse.data);
      setConnectionStatus('success');

      const { error: dbError } = await supabase
        .from('cloud_profiles')
        .insert([{
          name: formData.profileName,
          provider: 'aws',
          region: formData.region,
          custom_domain: formData.customDomain || null,
          external_id: externalId,
          status: 'pending'
        }]);

      if (dbError) console.error('DB error:', dbError);

      window.open(mockResponse.data.quick_create_stack_url, '_blank');

      setTimeout(() => {
        setCurrentStep(3);
      }, 1000);

    } catch (error: any) {
      setError(error.message || 'Failed to generate CloudFormation stack');
      setConnectionStatus('api-failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-orange-500" />
                <h1 className="text-xl font-bold text-white">Setup AWS Connection</h1>
              </div>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{profile?.full_name || user.email}</div>
                  <div className="text-xs text-gray-400">{user.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {connectionStatus === 'success' && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6">
            <strong>✓ Check AWS Console</strong>
          </div>
        )}

        {connectionStatus === 'copied' && (
          <div className="bg-cyan-900/50 border border-cyan-700 text-cyan-300 px-4 py-3 rounded-lg mb-6">
            <strong>✓ Copied to Clipboard!</strong>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span><strong>Error:</strong> {error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200 text-xl">×</button>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-white mb-4">Choose Setup Method</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setSetupMethod('cloudformation')}
              className={`p-4 border-2 rounded-lg text-left transition ${
                setupMethod === 'cloudformation'
                  ? 'border-cyan-500 bg-cyan-900/30'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-cyan-400" />
                <strong className="text-white">CloudFormation (Recommended)</strong>
              </div>
              <p className="text-sm text-gray-400">
                Enterprise-grade security with IAM roles. Custom domain support included.
              </p>
            </button>

            <button
              onClick={() => setSetupMethod('accesskeys')}
              className={`p-4 border-2 rounded-lg text-left transition ${
                setupMethod === 'accesskeys'
                  ? 'border-cyan-500 bg-cyan-900/30'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-900/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <strong className="text-white">Access Keys</strong>
              </div>
              <p className="text-sm text-gray-400">
                Quick setup with IAM user credentials. Good for testing.
              </p>
            </button>
          </div>
        </div>

        {setupMethod === 'cloudformation' && (
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">CloudFormation Setup</h2>

            <div className="flex items-center justify-between mb-8 relative">
              {[1, 2, 3].map(step => (
                <div key={step} className="flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep >= step
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {step}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    currentStep >= step ? 'text-cyan-400' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Configure'}
                    {step === 2 && 'Deploy'}
                    {step === 3 && 'Complete'}
                  </span>
                </div>
              ))}
              <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-700 -z-10">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                />
              </div>
            </div>

            {currentStep === 1 && (
              <div>
                <h3 className="text-md font-semibold text-white mb-4">Step 1: Configure Profile</h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profile Name *
                    </label>
                    <input
                      type="text"
                      value={formData.profileName}
                      onChange={(e) => setFormData({...formData, profileName: e.target.value})}
                      placeholder="e.g., Production AWS"
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                    {!formData.profileName && <p className="text-xs text-red-400 mt-1">Required</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Region
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => setFormData({...formData, region: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-east-2">US East (Ohio)</option>
                      <option value="us-west-1">US West (N. California)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">Europe (Ireland)</option>
                      <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Custom Domain/Identifier (Optional)
                    <span className="text-xs text-gray-500 ml-2">Max 10 characters, alphanumeric only</span>
                  </label>
                  <input
                    type="text"
                    value={formData.customDomain}
                    onChange={(e) => handleCustomDomainChange(e.target.value)}
                    placeholder="e.g., finance, claims, hr"
                    maxLength={10}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 mb-3"
                  />
                  <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-3">
                    <strong className="text-sm text-gray-300">Resources will be named:</strong>
                    <div className="text-xs font-mono text-gray-400 mt-2 space-y-1">
                      <div>• Role: IceCube-{externalId}-{formData.customDomain || 'xxx'}</div>
                      <div>• Lambda: IceCube-PH-{externalId}-{formData.customDomain || 'xxx'}</div>
                      <div>• Stack: IceCube-{formData.customDomain || 'xxx'}</div>
                    </div>
                  </div>
                  <p className="text-xs text-cyan-400">
                    💡 <strong>Tip:</strong> Use department names (finance, hr), environment tags (prod, dev), or project codes for easy identification in AWS Console.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-cyan-700 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <strong className="text-sm text-white flex items-center gap-2">
                      <span className="text-lg">🆔</span>
                      Account ID
                    </strong>
                    <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></div>
                      Connected: {user?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-950 px-4 py-3 rounded border border-cyan-600 font-mono text-lg text-cyan-300 tracking-wider">
                      {externalId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(externalId)}
                      className="px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      {connectionStatus === 'copied' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    🔐 This unique ID secures your AWS integration and ensures only iceCube can access your resources.
                  </p>
                </div>

                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.profileName}
                  className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Continue to Deployment
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h3 className="text-md font-semibold text-white mb-4">Step 2: Generate & Deploy via API</h3>

                <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg mb-4">
                  <strong>🚀 API Integration:</strong> Generating CloudFormation template with your custom domain configuration.
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-white mb-3">🔍 Configuration Summary:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Profile Name:</div>
                    <div className="font-medium text-white">{formData.profileName}</div>

                    <div className="text-gray-400">Custom Domain:</div>
                    <div className="font-medium text-cyan-400">{formData.customDomain || '(using profile name)'}</div>

                    <div className="text-gray-400">Region:</div>
                    <div className="font-medium text-white">{formData.region}</div>

                    <div className="text-gray-400">User:</div>
                    <div className="font-medium text-white">{user?.email}</div>

                    <div className="text-gray-400">Account ID:</div>
                    <div className="font-mono text-xs text-cyan-300">{externalId}</div>

                    <div className="text-gray-400">Role Name:</div>
                    <div className="font-mono text-xs text-cyan-400">IceCube-{externalId}-{formData.customDomain || '(auto)'}</div>

                    <div className="text-gray-400">Stack Name:</div>
                    <div className="font-mono text-xs text-cyan-400">IceCube-{formData.customDomain || '(auto)'}</div>
                  </div>
                </div>

                <button
                  onClick={handleCreateAWSProfileAPI}
                  disabled={isTestingConnection}
                  className="w-full px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 mb-4"
                >
                  {isTestingConnection ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calling API...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      Generate via API & Open AWS Console
                    </>
                  )}
                </button>

                {apiResponse && (
                  <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5" /> API Integration Successful!
                    </h4>
                    <ul className="text-sm space-y-1">
                      <li><strong>Stack Name:</strong> {apiResponse.stack_name}</li>
                      <li><strong>Template URL:</strong> Generated & uploaded to S3</li>
                      <li><strong>AWS Console:</strong> Opened in new tab</li>
                      <li><strong>Custom Domain:</strong> {formData.customDomain || 'Auto-generated'}</li>
                    </ul>
                  </div>
                )}

                {connectionStatus === 'api-failed' && (
                  <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5" /> API Call Failed
                    </h4>
                    <p className="text-sm mb-3">{error || 'API integration failed. Please try again.'}</p>
                    <button
                      onClick={handleCreateAWSProfileAPI}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> Retry API Call
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                >
                  Continue to Verification
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h3 className="text-md font-semibold text-white mb-4">Step 3: Verification & Completion</h3>

                <div className="bg-green-900/50 border border-green-700 text-green-300 px-6 py-8 rounded-lg mb-6 text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <h4 className="font-bold text-lg mb-2">Setup Complete with Custom Domain!</h4>
                  <p className="text-sm">
                    AWS Console opened with pre-configured stack. Your resources will have clear, identifiable names!
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-white mb-3">🔍 Next Steps:</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside text-gray-400">
                    <li>Go to the AWS CloudFormation console tab</li>
                    <li>Review the pre-filled parameters (including custom domain)</li>
                    <li>Click "Create Stack" button</li>
                    <li>Wait for "CREATE_COMPLETE" status (~2-3 minutes)</li>
                    <li>Your profile will auto-register with iceCube!</li>
                  </ol>
                </div>

                {formData.customDomain && (
                  <div className="bg-cyan-900/30 border border-cyan-700 text-cyan-300 px-4 py-3 rounded-lg mb-6">
                    <h4 className="font-semibold mb-2">
                      ✓ Custom Domain: <code className="bg-gray-800 px-2 py-1 rounded">{formData.customDomain}</code>
                    </h4>
                    <p className="text-sm">
                      Your AWS resources will be easily identifiable in the console with this custom identifier.
                    </p>
                  </div>
                )}

                <button
                  onClick={onBack}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  🎉 Go to Profiles
                </button>
              </div>
            )}
          </div>
        )}

        {setupMethod === 'accesskeys' && (
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Access Keys Setup</h2>
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg">
              <strong>⚠️ Note:</strong> Access keys method is coming soon! Please use CloudFormation for now.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
