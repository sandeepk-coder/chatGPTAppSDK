import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

// Function to fetch products from DummyJSON API
const fetchProducts = async (query: string) => {
  //const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`);
 const response = await fetch(`https://dummyjson.com/products/`);
  //const response = await fetch('https://mapi.indiamart.com/wservce/im/search/?AK=eyJhbGciOiJzaGEyNTYiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiI5KjUqMSo1KjkqIiwiY2R0IjoiMDMtMTEtMjAyNSIsImV4cCI6MTc2MjI1OTExNywiaWF0IjoxNzYyMTcyNzE3LCJpc3MiOiJVU0VSIiwic3ViIjoiMjI5Mzc1OTQifQ.ESjxD7q1vjdrkRkOESI-nxIUzvcp5B_9Em-HPmnxYhE&APP_ACCURACY=&APP_LATITUDE=&APP_LONGITUDE=&APP_MODID=IOS&APP_SCREEN_NAME=Search Products&APP_USER_ID=22937594&VALIDATION_GLID=22937594&VALIDATION_USERCONTACT=9555125193&VALIDATION_USER_IP=106.205.203.214&app_version_no=13.5.6_b_2&biztype_data=&glusrid=22937594&implicit_info_city_data=Gurgaon&implicit_info_cityid_data=70497&modid=IOS&options_filters_catid_data=&page=1&q=jute bag&source=ios.search&ss=jute bag&token=imartenquiryprovider') 
 console.log('bmt','Fetching url :https://dummyjson.com/products/');
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }
  return await response.json();
};

const handler = createMcpHandler(async (server) => {
  const html = await getAppsSdkCompatibleHtml(baseURL, "/");
  const productsHtml = await getAppsSdkCompatibleHtml(baseURL, "/products");

  const contentWidget: ContentWidget = {
    id: "show_content",
    title: "Show Content",
    templateUri: "ui://widget/content-template.html",
    invoking: "Loading content...",
    invoked: "Content loaded",
    html: html,
    description: "Displays the homepage content",
    widgetDomain: "https://nextjs.org/docs",
  };

  const productsWidget: ContentWidget = {
    id: "search_products",
    title: "Search Products",
    templateUri: "ui://widget/products-template.html",
    invoking: "Searching products...",
    invoked: "Products loaded",
    html: productsHtml,
    description: "Search and display products in a carousel",
    widgetDomain: "https://dummyjson.com",
  };
  // Register content widget resource
  server.registerResource(
    "content-widget",
    contentWidget.templateUri,
    {
      title: contentWidget.title,
      description: contentWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": contentWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${contentWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": contentWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": contentWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register products widget resource
  server.registerResource(
    "products-widget",
    productsWidget.templateUri,
    {
      title: productsWidget.title,
      description: productsWidget.description,
      mimeType: "text/html+skybridge",
      _meta: {
        "openai/widgetDescription": productsWidget.description,
        "openai/widgetPrefersBorder": true,
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+skybridge",
          text: `<html>${productsWidget.html}</html>`,
          _meta: {
            "openai/widgetDescription": productsWidget.description,
            "openai/widgetPrefersBorder": true,
            "openai/widgetDomain": productsWidget.widgetDomain,
          },
        },
      ],
    })
  );

  // Register content tool
  server.registerTool(
    contentWidget.id,
    {
      title: contentWidget.title,
      description:
        "Fetch and display the homepage content with the name of the user",
      inputSchema: {
        name: z.string().describe("The name of the user to display on the homepage"),
      },
      _meta: widgetMeta(contentWidget),
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: name,
          },
        ],
        structuredContent: {
          name: name,
          timestamp: new Date().toISOString(),
        },
        _meta: widgetMeta(contentWidget),
      };
    }
  );

  // Register products search tool
  server.registerTool(
    productsWidget.id,
    {
      title: productsWidget.title,
      description: "Search for products and display them in a carousel",
      inputSchema: {
        query: z.string().describe("The search query for products (e.g., 'phone', 'laptop')"),
      },
      _meta: widgetMeta(productsWidget),
    },
    async ({ query }) => {
      try {
        const productsDataRaw = await fetchProducts(query);
        console.log('bmt','before transform');
      //  const productsData = transformResponse(productsDataRaw)
        console.log('bmt','after transform');
        console.log('bmt','Fetched new products data:', productsDataRaw);
        return {
          content: [
            {
              type: "text",
              text: `Found ${productsDataRaw} products for "${query}"`,
            },
          ],
          structuredContent: {
            query: query,
            products: productsDataRaw,
            total: productsDataRaw.total,
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(productsWidget),
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error searching for products: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          structuredContent: {
            query: query,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          _meta: widgetMeta(productsWidget),
        };
      }
    }
  );
});


type InputFormat = {
  results: Array<{
    fields: {
      price_f?: string | number;
      title?: string;
      large_image?: string;
      original_title?:string;
      state?:string;
      address?:string;
      displayid?:string;
      supplier_rating?:string;
      [key: string]: any;
    };
  }>;
};

type OutputProduct = {
  price: number;
  title: string;
  thumbnail: string;
  id: string;
  category: string;
  rating: string;
  brand: string;
  description: string;

};

type OutputFormat = {
  products: OutputProduct[];
};

/**
 * Converts IndiaMART-style JSON (image 1) to ProductCarousel-ready format (image 2)
 */
export function transformResponse(input: InputFormat): OutputFormat {
  if (!input?.results || !Array.isArray(input.results)) {
    return { products: [] };
  }

  const products: OutputProduct[] = input.results
    .map((item) => {
      const f = item.fields ?? {};
      const priceNum = parseFloat(String(f.price_f || "0"));
      const title = f.title?.trim() || "Unnamed Product";
      const thumbnail = f.large_image?.trim() || "https://via.placeholder.com/400x300";
      const id = f.displayid || "1";
      const category = f.original_title?.trim() || "Unnamed Product";
      const rating = f.supplier_rating || "Unnamed Product";
      const brand = f.title?.trim() || "IndiaMART";
      const description = f.address?.trim() || "Unnamed Product";

      return {
        price: isNaN(priceNum) ? 0 : priceNum,
        title,
        thumbnail,
        id,
        category,
        rating,
        brand,
        description,
      };
    })
    .filter((p) => !!p.title);

  return { products };
}

// Example usage:
const apiResponse = {
  results: [
    {
      fields: {
        price_f: "9.99",
        title: "Essence Mascara Lash Princess",
        large_image: "https://example.com/img.jpg",
      },
    },
  ],
};

//console.log(transformResponse(apiResponse));


//export const GET = handler;
export const POST = handler;
// app/api/products/route.ts (example path)
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "jute bag";

  try {
    const apiUrl = `https://mapi.indiamart.com/wservce/im/search/?AK=eyJhbGciOiJzaGEyNTYiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiI5KjUqMSo1KjkqIiwiY2R0IjoiMDMtMTEtMjAyNSIsImV4cCI6MTc2MjI1OTExNywiaWF0IjoxNzYyMTcyNzE3LCJpc3MiOiJVU0VSIiwic3ViIjoiMjI5Mzc1OTQifQ.ESjxD7q1vjdrkRkOESI-nxIUzvcp5B_9Em-HPmnxYhE&APP_MODID=ANDROID&page=1&q=${encodeURIComponent(query)}&options_start=0&options_end=20`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    const results = data?.response?.results;
    console.log('bmt','GET Function returns:', results);
    const products = Array.isArray(results)
      ? results.filter((r: any) => r.PRODUCTNAME).map((item: any, i: number) => ({
          id: i + 1,
          title: item.PRODUCTNAME || "Unnamed Product",
          category: item.CITY || "IndiaMART",
          // keep price as a string; your carousel shows it next to a currency symbol
          price: item.PRICE?.toString()?.trim() || "Price on Request",
          thumbnail: item.PRODUCTIMAGE1 || "https://via.placeholder.com/400x300?text=No+Image",
          brand: item.COMPANYNAME || "",
          description: item.MINIMUMORDERQUANTITY ? `MOQ: ${item.MINIMUMORDERQUANTITY}` : "",
        }))
      : [];

    return NextResponse.json({ query, total: products.length, products });
  } catch (err: any) {
    return NextResponse.json({ query, total: 0, products: [], error: err?.message ?? "Failed to fetch" }, { status: 500 });
  }
}
