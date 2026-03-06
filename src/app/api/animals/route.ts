import { NextResponse } from 'next/server';

// 1. Centralizamos los headers de CORS para no repetirlos
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 2. Manejador para la petición Preflight (OPTIONS) del navegador
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const animalName = searchParams.get('name') || 'cheetah';

    const apiUrl = `${process.env.EXTERNAL_API_URL}?name=${animalName}`;

    const response = await fetch(apiUrl, {
      headers: {
        'X-Api-Key': process.env.EXTERNAL_API_KEY as string,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al comunicarse con la API de terceros');
    }

    const data = await response.json();

    // Devolvemos los datos inyectando los headers de permiso
    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    // Si la API falla (ej. API Key incorrecta), también devolvemos los headers
    // para que el frontend pueda leer el error en lugar de bloquearse por CORS
    return NextResponse.json(
      { error: 'Fallo en el servidor proxy' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}