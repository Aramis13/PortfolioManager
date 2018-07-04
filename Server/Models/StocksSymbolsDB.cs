using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Server.Models
{
    public class StockInfo
    {
        public string name;
        public string symbol;
    }


    public class StocksSymbolsDB
    {
        List<StockInfo> stocks;

        public StocksSymbolsDB()
        {
            stocks = new List<StockInfo>();


            string path = AppDomain.CurrentDomain.BaseDirectory;
            path += "App_Data\\Stock Symbols.txt";
           
            string json = File.ReadAllText(path);


            JArray a = JArray.Parse(json);



            foreach (JObject o in a.Children<JObject>())
            {
                foreach (JProperty p in o.Properties())
                {
                    stocks.Add(new StockInfo() { name = p.Name, symbol = p.Value.ToString() });
                }
            }

        }
    }
}