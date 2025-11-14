const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { code, notebookId, cellId } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Code is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const startTime = Date.now();
    let output = '';
    let error = null;

    try {
      const sanitizedCode = code.trim();
      
      if (
        sanitizedCode.includes('os.system') ||
        sanitizedCode.includes('subprocess') ||
        sanitizedCode.includes('eval(') ||
        sanitizedCode.includes('exec(') ||
        sanitizedCode.includes('__import__')
      ) {
        throw new Error('Potentially dangerous operations detected. System calls and eval are not allowed.');
      }

      const codeLines = sanitizedCode.split('\n');
      const outputLines: string[] = [];

      for (const line of codeLines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('print(')) {
          const match = trimmedLine.match(/print\((.+?)\)/);
          if (match) {
            try {
              const content = match[1].replace(/['"`]/g, '');
              outputLines.push(content);
            } catch {
              outputLines.push(match[1]);
            }
          }
        }
        else if (trimmedLine.includes('=') && !trimmedLine.startsWith('#')) {
          const [varName] = trimmedLine.split('=').map(s => s.trim());
          if (varName && !varName.includes(' ')) {
            outputLines.push(`${varName} assigned`);
          }
        }
        else if (trimmedLine.startsWith('import ') || trimmedLine.startsWith('from ')) {
          outputLines.push(`✓ ${trimmedLine}`);
        }
      }

      if (outputLines.length === 0) {
        outputLines.push('Code executed successfully');
        outputLines.push('');
        outputLines.push('💡 Tip: Use print() statements to see output');
      }

      output = outputLines.join('\n');

      const analysisOutput = [];
      analysisOutput.push('=== Python Code Analysis ===');
      analysisOutput.push(`Lines of code: ${codeLines.length}`);
      
      const imports = codeLines.filter(l => l.trim().startsWith('import') || l.trim().startsWith('from'));
      if (imports.length > 0) {
        analysisOutput.push(`Imports: ${imports.length}`);
      }
      
      const printStatements = codeLines.filter(l => l.includes('print('));
      if (printStatements.length > 0) {
        analysisOutput.push(`Print statements: ${printStatements.length}`);
      }

      analysisOutput.push('');
      analysisOutput.push('=== Output ===');
      analysisOutput.push(output);
      analysisOutput.push('');
      analysisOutput.push('Note: Full Python execution requires a Python runtime environment.');
      analysisOutput.push('Current mode: Simulated execution with code analysis.');

      output = analysisOutput.join('\n');

    } catch (err: any) {
      error = err.message || 'Code execution failed';
      output = `Error: ${error}\n\nTraceback (simulated):\n  File "<notebook>", line 1\n    ${code.split('\n')[0]}\n    ^\nError: ${error}`;
    }

    const executionTime = Date.now() - startTime;

    const response = {
      success: !error,
      output: output,
      error: error,
      executionTime,
      timestamp: new Date().toISOString(),
      language: 'python',
    };

    return new Response(
      JSON.stringify(response),
      {
        status: error ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Python execution error:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});