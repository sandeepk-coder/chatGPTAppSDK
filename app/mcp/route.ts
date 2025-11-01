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
  const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`);
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
        const productsData = await fetchProducts(query);
        console.log('bmt','Fetched products data:', productsData);
        return {
          content: [
            {
              type: "text",
              text: `Found ${productsData.total} products for "${query}"`,
            },
          ],
          structuredContent: {
            query: query,
            products: productsData.products,
            total: productsData.total,
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

export const GET = handler;
export const POST = handler;
