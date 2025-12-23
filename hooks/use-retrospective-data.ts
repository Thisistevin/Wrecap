import { useEffect, useState } from 'react';

export interface RetrospectiveTextData {
  titulo: string;
  metricas_temporais: {
    inicio: string;
    fim: string;
    constancia_conversa: string;
  };
  tipo_de_amizade: {
    nome_criativo: string;
    descricao: string;
    por_que: string;
    pilares: string;
    exemplo_real: {
      autor: string;
      message: string;
      hour: string;
    };
  };
  melhores_momentos_eventos: string[];
  momentos_engracados_piadas: {
    itens: string[];
    exemplo_real: {
      autor: string;
      message: string;
      hour: string;
    };
  };
  expressoes_internas: string[];
  metas_proximo_ano: string[];
  fechamento: string;
}

export interface RetrospectiveImageData {
  mainImage: string;
  secondaryImage: string;
}

export function useRetrospectiveData(retrospectiveId: string) {
  const [textData, setTextData] = useState<RetrospectiveTextData | null>(null);
  const [imageData, setImageData] = useState<RetrospectiveImageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Load text content from API
        const textResponse = await fetch(`/api/retrospective/${retrospectiveId}/content`);
        if (!textResponse.ok) {
          throw new Error(`Failed to load content: ${textResponse.statusText}`);
        }
        const textContent = await textResponse.json();
        setTextData(textContent);

        // Load retrospective metadata to get image URLs
        try {
          const retroResponse = await fetch(`/api/retrospective/${retrospectiveId}/metadata`);
          if (retroResponse.ok) {
            const retroMeta = await retroResponse.json();
            
            if (retroMeta.userPic || retroMeta.friendPic) {
              setImageData({
                mainImage: retroMeta.userPic || '',
                secondaryImage: retroMeta.friendPic || '',
              });
            } else {
              setImageData({
                mainImage: '',
                secondaryImage: '',
              });
            }
          } else {
            const errorText = await retroResponse.text();
            if (process.env.NODE_ENV === 'development') {
              console.error('❌ Failed to load image metadata:', retroResponse.status, errorText);
            }
            setImageData({
              mainImage: '',
              secondaryImage: '',
            });
          }
        } catch (imgError: any) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ Error loading image metadata:', imgError);
          }
          setImageData({
            mainImage: '',
            secondaryImage: '',
          });
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    }

    if (retrospectiveId) {
      loadData();
    }
  }, [retrospectiveId]);

  return { textData, imageData, loading, error };
}

