using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Web;
using Newtonsoft.Json.Linq;
using Server.Controllers;

namespace Server.Models
{

    public class User
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("password")]
        public string Password { get; set; }

        [JsonProperty("Fname")]
        public string Fname { get; set; }

        [JsonProperty("Lname")]
        public string Lname { get; set; }

        [JsonProperty("stocks")]
        public List<string> Stocks { get; set; }

        public User()
        {
            Stocks = new List<string>();
        }

    }

    public class Stocks
    {
        [JsonProperty("symbol")]
        public string Symbol { get; set; }

        [JsonProperty("Purchase Date")]
        public string PurchaseDate { get; set; }

        [JsonProperty("Purchase Value")]
        public string PurchaseValue { get; set; }
    }

    public class UserBuyInfo
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("stocks")]
        public List<Stocks> Stocks { get; set; }

        public UserBuyInfo()
        {
            Stocks = new List<Stocks>();
        }

    }

    public class Users
    {

        public List<User> usersDB = new List<User>();
        public List<UserBuyInfo> usersBuyInfo = new List<UserBuyInfo>(); 

        public Users()
        {
            string path = AppDomain.CurrentDomain.BaseDirectory;
           
            path += "App_Data\\UsersData.txt";
            string json = "[]";
            lock (LoginController.mutex)
            {
                json = File.ReadAllText(path);
            }
            JArray a = JArray.Parse("[]");
            try
            {
                a = JArray.Parse(json);
            }
            catch
            {
                
            }
            string value = string.Empty;
            foreach (JObject o in a.Children<JObject>())
            {
                User user = new User();

                foreach (JProperty p in o.Properties())
                {
                    string name = p.Name;
                    switch (name)
                    {
                        case "Fname": user.Fname = (string)p.Value; break;
                        case "Lname": user.Lname = (string)p.Value; break;
                        case "password": user.Password = (string)p.Value; break;
                        case "email": user.Email = (string)p.Value; break;
                        case "stocks":
                            JArray b = JArray.Parse(p.Value.ToString());
                            List<string> st = user.Stocks;
                            foreach (string stock in b.Root.Children())
                            {
                                st.Add(stock);
                            }
                            break;
                    }
                }
                usersDB.Add(user);
            }


            path = AppDomain.CurrentDomain.BaseDirectory;

            path += "App_Data\\Stock Buy Info.txt";

            lock (LoginController.mutex)
            {
                json = File.ReadAllText(path);
            }

            a = JArray.Parse("[]");
            try
            {
                a = JArray.Parse(json);
            }
            catch { }

            foreach (JObject o in a.Children<JObject>())
            {
                UserBuyInfo buyinfo = new UserBuyInfo();
                foreach (JProperty p in o.Properties())
                {
                    

                    if (p.Name.Equals("stocks"))
                    {

                        JArray s = JArray.Parse(p.Value.ToString());
                        foreach (JObject t in s.Children<JObject>())
                        {
                            Stocks stInfo = new Stocks();
                            foreach (JProperty e in t.Properties())
                            {
                                string val = e.Name;
                                switch (val)
                                {
                                    case "symbol": stInfo.Symbol = (string)e.Value; break;
                                    case "Purchase Date": stInfo.PurchaseDate = (string)e.Value; break;
                                    case "Purchase Value": stInfo.PurchaseValue = (string)e.Value; break;
                                }
                                
                                //stInfo.Symbol = e.Name;
                                //foreach (JObject v in e.Children<JObject>())
                                //{
                                //    foreach (JProperty n in v.Properties())
                                //    {
                                //        if (n.Name.ToString().Equals("Purchase Date"))
                                //            stInfo.PurchaseDate = (string)n.Value;
                                //        else
                                //            stInfo.PurchaseValue = (string)n.Value;
                                //    }
                                //    buyinfo.Stocks.Add(stInfo);
                                //}
                            }
                            buyinfo.Stocks.Add(stInfo);
                        }

                    }
                    else
                    {
                        buyinfo.Email = (string)p.Value;
                    }

                }


                usersBuyInfo.Add(buyinfo);
            }
           
        }

    }
}