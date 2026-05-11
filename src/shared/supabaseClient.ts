// Mock Supabase client for development - the actual client has Node.js compatibility issues
// Replace with real implementation when Supabase is properly configured

const createMockClient = () => {
  const mockData: Record<string, Record<string, unknown>> = {
    documents: {},
    app_settings: {
      global: {
        id: "global",
        n8n_webhook_url: "",
        contact_email: "",
        whatsapp_phone: "",
        physical_address: "",
      },
    },
    log_errors: {},
    auth: {},
  };

  // Extract data array from table data
  const getDataArray = (tableData: unknown): unknown[] => {
    if (
      tableData &&
      typeof tableData === "object" &&
      !Array.isArray(tableData)
    ) {
      return Object.values(tableData);
    }
    if (Array.isArray(tableData)) {
      return tableData;
    }
    return [];
  };

  // Filter items by key-value pair
  const filterByKeyValue = (
    items: unknown[],
    key: string,
    value: unknown,
  ): unknown[] => {
    return items.filter((item) => {
      if (item && typeof item === "object") {
        return (item as Record<string, unknown>)[key] === value;
      }
      return false;
    });
  };

  // Update records matching key-value pair
  const updateRecords = (
    tableDataObj: Record<string, unknown>,
    key: string,
    value: unknown,
    newData: Record<string, unknown>,
  ): Record<string, unknown> => {
    const updated: Record<string, unknown> = {};
    Object.entries(tableDataObj).forEach(([k, v]) => {
      if (v && typeof v === "object") {
        const vRecord = v as Record<string, unknown>;
        if (vRecord[key] === value) {
          updated[k] = { ...vRecord, ...newData };
        } else {
          updated[k] = v;
        }
      } else {
        updated[k] = v;
      }
    });
    return updated;
  };

  return {
    from: (table: string) => {
      return {
        select: () => {
          const tableData = mockData[table] || {};
          let dataArray = getDataArray(tableData);

          // Query builder with proper method chaining
          const builder = {
            eq: (key: string, value: unknown) => {
              dataArray = filterByKeyValue(dataArray, key, value);
              return builder;
            },
            single: () => {
              const item = dataArray[0];
              return Promise.resolve({ data: item || null, error: null });
            },
            order: () => builder,
            range: () => builder,
            ilike: () => builder,
            not: () => builder,
            is: () => builder,
          };
          return builder;
        },
        insert: (data: Record<string, unknown>) => {
          const newRecord = { ...data, id: crypto.randomUUID() };
          const tableDataObj = mockData[table];
          if (
            typeof tableDataObj === "object" &&
            !Array.isArray(tableDataObj)
          ) {
            mockData[table] = {
              ...tableDataObj,
              [newRecord.id as string]: newRecord,
            };
          } else {
            mockData[table] = { [newRecord.id as string]: newRecord };
          }
          return Promise.resolve({ data: [newRecord], error: null });
        },
        update: (data: Record<string, unknown>) => ({
          eq: (key: string, value: unknown) => {
            const tableDataObj = mockData[table];
            if (
              typeof tableDataObj === "object" &&
              !Array.isArray(tableDataObj)
            ) {
              const updated = updateRecords(tableDataObj, key, value, data);
              mockData[table] = updated;
            }
            return Promise.resolve({ data: [data], error: null });
          },
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      };
    },
    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null, session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
};

export const supabase = createMockClient();
export type { SupabaseClient } from "@supabase/supabase-js";
