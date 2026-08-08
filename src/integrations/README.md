# integrations/

Clientes de servicios externos. Todavía vacío.

Al conectar Supabase, acá va **el único** cliente del proyecto:

```
integrations/supabase/client.ts   → createClient<Database>(...)
integrations/supabase/types.ts    → tipos generados de la base
```

Nunca crear instancias adicionales del cliente en otros archivos
(ver `ai-pmp/supabase-rules.txt`).
