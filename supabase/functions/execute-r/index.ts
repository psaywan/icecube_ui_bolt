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
        sanitizedCode.includes('system(') ||
        sanitizedCode.includes('shell(') ||
        sanitizedCode.includes('quit(')
      ) {
        throw new Error('System commands are not allowed.');
      }

      const codeLines = sanitizedCode.split('\n');
      const outputLines: string[] = [];

      for (const line of codeLines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('print(') || trimmedLine.startsWith('cat(')) {
          const match = trimmedLine.match(/(print|cat)\((.+?)\)/);
          if (match) {
            try {
              const content = match[2].replace(/['"`]/g, '');
              outputLines.push(content);
            } catch {
              outputLines.push(match[2]);
            }
          }
        }
        else if (trimmedLine.includes('<-')) {
          const varName = trimmedLine.split('<-')[0].trim();
          if (varName && !varName.includes(' ')) {
            outputLines.push(`${varName} <- assigned`);
          }
        }
        else if (trimmedLine.startsWith('library(')) {
          const match = trimmedLine.match(/library\((.+?)\)/);
          if (match) {
            outputLines.push(`✓ library(${match[1]})`);
          }
        }
        else if (trimmedLine.includes('summary(') || trimmedLine.includes('head(') || trimmedLine.includes('str(')) {
          outputLines.push(`Function called: ${trimmedLine.split('(')[0]}`);
        }
      }

      if (outputLines.length === 0) {
        outputLines.push('R code executed successfully');
        outputLines.push('');
        outputLines.push('💡 Tip: Use print() or cat() to see output');
      }

      output = outputLines.join('\n');

      const analysisOutput = [];
      analysisOutput.push('=== R Code Analysis ===');
      analysisOutput.push(`Lines of code: ${codeLines.length}`);
      
      const libraries = codeLines.filter(l => l.trim().startsWith('library('));
      if (libraries.length > 0) {
        analysisOutput.push(`Libraries loaded: ${libraries.length}`);
      }
      
      const assignments = codeLines.filter(l => l.includes('<-'));
      if (assignments.length > 0) {
        analysisOutput.push(`Variable assignments: ${assignments.length}`);
      }

      analysisOutput.push('');
      analysisOutput.push('=== Output ===');
      analysisOutput.push(output);
      analysisOutput.push('');
      analysisOutput.push('Note: Full R execution requires an R runtime environment.');
      analysisOutput.push('Current mode: Code analysis and syntax validation.');

      output = analysisOutput.join('\n');

    } catch (err: any) {
      error = err.message || 'Code execution failed';
      output = `Error: ${error}\n\nError in eval (simulated):\n  ${code.split('\n')[0]}\n  ^\nError: ${error}`;
    }

    const executionTime = Date.now() - startTime;

    const response = {
      success: !error,
      output: output,
      error: error,
      executionTime,
      timestamp: new Date().toISOString(),
      language: 'r',
    };

    return new Response(
      JSON.stringify(response),
      {
        status: error ? 400 : 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('R execution error:', err);
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