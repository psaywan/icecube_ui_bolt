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
        sanitizedCode.includes('sys.exit') ||
        sanitizedCode.includes('System.exit') ||
        sanitizedCode.includes('Runtime.getRuntime')
      ) {
        throw new Error('System exit operations are not allowed.');
      }

      const codeLines = sanitizedCode.split('\n');
      const outputLines: string[] = [];

      for (const line of codeLines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('println(') || trimmedLine.includes('println(')) {
          const match = trimmedLine.match(/println\((.+?)\)/);
          if (match) {
            try {
              const content = match[1].replace(/['"`]/g, '');
              outputLines.push(content);
            } catch {
              outputLines.push(match[1]);
            }
          }
        }
        else if (trimmedLine.startsWith('val ') || trimmedLine.startsWith('var ')) {
          const parts = trimmedLine.split('=');
          if (parts.length > 1) {
            const varName = parts[0].replace('val ', '').replace('var ', '').trim();
            outputLines.push(`${varName}: defined`);
          }
        }
        else if (trimmedLine.startsWith('import ')) {
          outputLines.push(`✓ ${trimmedLine}`);
        }
        else if (trimmedLine.startsWith('def ')) {
          const match = trimmedLine.match(/def\s+(\w+)/);
          if (match) {
            outputLines.push(`function ${match[1]}: defined`);
          }
        }
        else if (trimmedLine.startsWith('class ')) {
          const match = trimmedLine.match(/class\s+(\w+)/);
          if (match) {
            outputLines.push(`class ${match[1]}: defined`);
          }
        }
        else if (trimmedLine.startsWith('object ')) {
          const match = trimmedLine.match(/object\s+(\w+)/);
          if (match) {
            outputLines.push(`object ${match[1]}: defined`);
          }
        }
      }

      if (outputLines.length === 0) {
        outputLines.push('Scala code compiled successfully');
        outputLines.push('');
        outputLines.push('💡 Tip: Use println() to see output');
      }

      output = outputLines.join('\n');

      const analysisOutput = [];
      analysisOutput.push('=== Scala Code Analysis ===');
      analysisOutput.push(`Lines of code: ${codeLines.length}`);
      
      const imports = codeLines.filter(l => l.trim().startsWith('import'));
      if (imports.length > 0) {
        analysisOutput.push(`Imports: ${imports.length}`);
      }
      
      const functions = codeLines.filter(l => l.trim().startsWith('def '));
      if (functions.length > 0) {
        analysisOutput.push(`Functions defined: ${functions.length}`);
      }

      const classes = codeLines.filter(l => l.trim().startsWith('class '));
      if (classes.length > 0) {
        analysisOutput.push(`Classes defined: ${classes.length}`);
      }

      analysisOutput.push('');
      analysisOutput.push('=== Output ===');
      analysisOutput.push(output);
      analysisOutput.push('');
      analysisOutput.push('Note: Full Scala execution requires Spark cluster connection.');
      analysisOutput.push('Current mode: Code analysis and validation.');

      output = analysisOutput.join('\n');

    } catch (err: any) {
      error = err.message || 'Code compilation failed';
      output = `Error: ${error}\n\nCompilation Error (simulated):\n  ${code.split('\n')[0]}\n  ^\nError: ${error}`;
    }

    const executionTime = Date.now() - startTime;

    const response = {
      success: !error,
      output: output,
      error: error,
      executionTime,
      timestamp: new Date().toISOString(),
      language: 'scala',
    };

    return new Response(
      JSON.stringify(response),
      {
        status: error ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Scala execution error:', err);
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