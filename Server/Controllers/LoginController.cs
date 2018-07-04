using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Server.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Web.Http;

namespace Server.Controllers
{

    public class LoginController : ApiController
    {

        public Users users = new Users();

        public static object mutex = new object();
        
        [HttpGet]
        public string Get(object val)
        {
            string path = AppDomain.CurrentDomain.BaseDirectory;
            path += "App_Data\\Stock Symbols.txt";

            string json = string.Empty;
            lock (mutex)
            {
                json = File.ReadAllText(path);
            }
            return json;
        }

        
        public string GetUser(string email)
        {
            var foundUser = users.usersDB.SingleOrDefault(item => item.Email == email);

            string json = JsonConvert.SerializeObject(foundUser);


            return json;
        }

        [HttpPost]
        public string Post(JObject jsonResult)
        {
            if (jsonResult == null)
                return "-2";
            string path = string.Empty;

            var resArr = jsonResult.Children().ToArray();

            int leanth = resArr.Length;

            if (leanth == 1)
            {

                if (resArr[0].ToString().Contains("GetJson"))
                {
                    path = AppDomain.CurrentDomain.BaseDirectory;

                    if (resArr[0].ToString().Contains("Currency"))
                        path += "App_Data\\Currencies.txt";
                    else
                        path += "App_Data\\Crypto.txt";

                    string json = string.Empty;
                    lock (mutex)
                    {
                        json = File.ReadAllText(path);
                    }

                    return json;


                }


                if (resArr[0].ToString().Contains("LoadPage"))
                {
                    path = AppDomain.CurrentDomain.BaseDirectory;

                    if (resArr[0].ToString().Contains("Currency"))
                        path += "currency.html";
                    else
                        path += "dashboard.html";


                    string json = string.Empty;
                    lock (mutex)
                    {
                        json = File.ReadAllText(path);
                    }

                    return json;
                }
                else if (resArr[0].ToString().Contains("stockemail"))
                {
                    path = AppDomain.CurrentDomain.BaseDirectory;

                    path += "App_Data\\Stock Buy Info.txt";
                    string json = string.Empty;
                    lock (mutex)
                    {
                        json = File.ReadAllText(path);
                    }

                    return json;
                }

                var userLogIn = JsonConvert.DeserializeObject<User>(jsonResult.ToString());

                var foundUser = users.usersDB.SingleOrDefault(item => item.Email == userLogIn.Email);

                if (foundUser == null)
                {
                    if (userLogIn.Email == "0")
                    {

                        path = AppDomain.CurrentDomain.BaseDirectory;

                        path += "login.html";
                        string r = string.Empty;
                        lock (mutex)
                        {
                            r = File.ReadAllText(path);
                        }
                        return r;
                    }

                    return "-1";
                }

                string res = JsonConvert.SerializeObject(foundUser);

                return res;
            }
            else if (leanth == 2)
            {
                if (resArr[1].ToString().Contains("stockstodelete"))
                {
                    dynamic data = JObject.Parse(jsonResult.ToString());
                    string email = data.email;
                    string stock = data.stockstodelete;

                    var foundUser = users.usersDB.SingleOrDefault(item => item.Email == email);

                    if (foundUser == null)
                        return "-1";

                    List<string> stocks = foundUser.Stocks;
                    if (!stocks.Remove(stock))
                        return "-2";

                    string res = JsonConvert.SerializeObject(users.usersDB);

                    path = AppDomain.CurrentDomain.BaseDirectory;

                    path += "App_Data\\UsersData.txt";

                    lock (mutex)
                    {
                        File.WriteAllText(path, res);
                    }


                    var undUser = users.usersBuyInfo.SingleOrDefault(item => item.Email == email);

                    if (undUser == null)
                        return "-1";

                    List<Stocks> st = undUser.Stocks;

                    var foundS = st.SingleOrDefault(item => item.Symbol == stock);

                    if (foundS == null)
                        return "-2";

                    st.Remove(foundS);

                    path = AppDomain.CurrentDomain.BaseDirectory;

                    path += "App_Data\\Stock Buy Info.txt";


                    var convertedJson = JsonConvert.SerializeObject(users.usersBuyInfo, Formatting.Indented);
                    lock (mutex)
                    {
                        File.WriteAllText(path, convertedJson);
                    }
                }
                else if (resArr[1].ToString().Contains("stocktoadd"))
                {
                    dynamic data = JObject.Parse(jsonResult.ToString());
                    string email = data.email;
                    string stock = data.stocktoadd;

                    var foundUser = users.usersDB.SingleOrDefault(item => item.Email == email);

                    if (foundUser == null)
                        return "-1";

                    List<string> stocks = foundUser.Stocks;
                    if (!stocks.Contains(stock))
                    {
                        stocks.Add(stock);

                        string res = JsonConvert.SerializeObject(users.usersDB);

                        path = AppDomain.CurrentDomain.BaseDirectory;

                        path += "App_Data\\UsersData.txt";
                        lock (mutex)
                        {
                            File.WriteAllText(path, res);
                        }
                    }

                }
                else
                {
                    var userLogIn = JsonConvert.DeserializeObject<User>(jsonResult.ToString());

                    var foundUser = users.usersDB.SingleOrDefault(item => item.Email == userLogIn.Email);

                    if (foundUser == null)
                        return "-1";

                    if (!foundUser.Password.Equals(userLogIn.Password))
                    {
                        return "-1";
                        
                    }

                }
            }
            else if (leanth == 4)
            {

                if (resArr[2].ToString().Contains("Purchase Date"))
                {

                  
                    dynamic data = JObject.Parse(jsonResult.ToString());
                    string email = data.email;
                    string symbol = data.symbol;
                    string Pdate = data["Purchase Date"];
                    string Pvalue = data["Purchase Value"];

                    var foundUser = users.usersBuyInfo.SingleOrDefault(item => item.Email == email);
                    var existuser = users.usersDB.SingleOrDefault(item => item.Email == email);
                    if (existuser != null)
                    {

                        path = AppDomain.CurrentDomain.BaseDirectory;

                        path += "App_Data\\Stock Buy Info.txt";
                        string json = string.Empty;
                        lock (mutex)
                        {
                            json = File.ReadAllText(path);
                        }
                        if (foundUser == null)
                        {
                      
                            //var list = JsonConvert.DeserializeObject<List<UserBuyInfo>>(json);

                            Stocks s = new Stocks()
                            {
                                Symbol = symbol,
                                PurchaseDate = Pdate,
                                PurchaseValue = Pvalue
                            };
                            UserBuyInfo u = new UserBuyInfo() { Email = email };
                            u.Stocks.Add(s);
                            users.usersBuyInfo.Add(u);
                            //users.usersBuyInfo = list;

                            var convertedJson = JsonConvert.SerializeObject(users.usersBuyInfo, Formatting.Indented);

                            lock (mutex)
                            {
                                File.WriteAllText(path, convertedJson);
                            }
                            return "1";
                        }
                        else
                        {
                            foundUser.Stocks.Add(new Stocks()
                            {
                                PurchaseDate = Pdate,
                                PurchaseValue = Pvalue,
                                Symbol = symbol
                            });

                            var convertedJson = JsonConvert.SerializeObject(users.usersBuyInfo, Formatting.Indented);

                            lock (mutex)
                            {
                                File.WriteAllText(path, convertedJson);
                            }
                            return "1";
                        }
                    }


                    return "-1";
                   
                    
                    

                }

                else
                {
                    var userSignUp = JsonConvert.DeserializeObject<User>(jsonResult.ToString());

                    var res = users.usersDB.Find(item => item.Email == userSignUp.Email);

                    if (res != null)
                        return "-1";

                    path = AppDomain.CurrentDomain.BaseDirectory;

                    path += "App_Data\\UsersData.txt";
                    string json = string.Empty;
                    //lock (mutex)
                    //{
                    //    json = File.ReadAllText(path);
                    //}
                    //if (string.IsNullOrEmpty(json))
                    //{
                    //    list = users.usersDB.Add(userSignUp);
                    //}
                    //    list = JsonConvert.DeserializeObject<List<User>>(json);



                    //list.Add(userSignUp);
                    users.usersDB.Add(userSignUp);
                    var convertedJson = JsonConvert.SerializeObject(users.usersDB, Formatting.Indented);

                    lock (mutex)
                    {
                        File.WriteAllText(path, convertedJson);
                    }

                    return "1";
                    //users.usersDB.Add(userSignUp);


                    //var foundUser = users.usersBuyInfo.SingleOrDefault(item => item.Email == userSignUp.Email);

                    //if (foundUser == null)
                    //    return "-1";

                    


                    //path = AppDomain.CurrentDomain.BaseDirectory;

                    //path += "App_Data\\Stock Buy Info.txt";

                    //users.usersBuyInfo.Add(new UserBuyInfo() { Email = userSignUp.Email });

                    //var convertedJson1 = JsonConvert.SerializeObject(users.usersBuyInfo, Formatting.Indented);
                    //lock (mutex)
                    //{
                    //    File.WriteAllText(path, convertedJson1);
                    //}
                }
            }
            

            path = AppDomain.CurrentDomain.BaseDirectory;
            path += "dashboard.html";
            string htmlMain = "";
            lock (mutex)
            {
                htmlMain = File.ReadAllText(path);
            }
            
             return htmlMain;
        }

    }
}
