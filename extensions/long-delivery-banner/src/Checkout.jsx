import '@shopify/ui-extensions/preact';
import {render} from "preact";
import {useState, useEffect} from "preact/hooks";

export default async () => {
  render(<Extension />, document.body)
};

function Extension() {
  const [hasLongDeliveryItems, setHasLongDeliveryItems] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkForLongDeliveryItems();
  }, []);

  async function checkForLongDeliveryItems() {
    try {
      if (shopify.lines && shopify.query) {
        const lines = shopify.lines.value;
        
        if (lines && lines.length > 0) {
          let foundLongDelivery = false;
          
          for (const line of lines) {
            if (line.merchandise && line.merchandise.product) {
              const product = line.merchandise.product;
              
              const productId = product.id;
              
              try {
                const metafieldsQuery = `
                  query getProductMetafields($id: ID!) {
                    product(id: $id) {
                      id
                      title
                      metafields(identifiers: [{namespace: "custom", key: "long_delivery"}]) {
                        namespace
                        key
                        value
                      }
                    }
                  }
                `;
                
                const metafieldsResponse = await shopify.query(metafieldsQuery, {
                  variables: { id: productId }
                });
                
                if (metafieldsResponse && metafieldsResponse.data) {
                  // @ts-ignore
                  const productData = metafieldsResponse.data.product;
                  if (productData && productData.metafields && productData.metafields.length > 0) {
                    const longDeliveryMetafield = productData.metafields.find(
                      metafield => 
                        metafield.namespace === 'custom' && 
                        metafield.key === 'long_delivery'
                    );
                    
                    if (longDeliveryMetafield) {
                      if (longDeliveryMetafield.value === 'true' || 
                          longDeliveryMetafield.value === 'True' || 
                          String(longDeliveryMetafield.value).toLowerCase() === 'true') {
                        foundLongDelivery = true;
                        break;
                      }
                    }
                  }
                }
              } catch (metafieldError) {
                // Silently handle metafield query errors
              }
            }
          }
          
          setHasLongDeliveryItems(foundLongDelivery);
        } else {
          setHasLongDeliveryItems(false);
        }
      } else {
        setHasLongDeliveryItems(true);
      }
    } catch (error) {
      setHasLongDeliveryItems(true);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return null;
  }

  if (!hasLongDeliveryItems) {
    return null;
  }
  
  return (
    <s-banner tone="critical">
      <s-stack gap="base">
        <s-text>
          {shopify.i18n.translate("longDeliveryTitle")}
        </s-text>
        <s-text>
          {shopify.i18n.translate("longDeliveryDescription")}
        </s-text>
      </s-stack>
    </s-banner>
  );
}